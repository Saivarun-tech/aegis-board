import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.database import SessionLocal
from app.models.collaboration import (
    CollaborationParticipant,
    CollaborationSession,
)
from app.models.session import UserSession
from app.models.user import User


router = APIRouter()


# ==================================================
# CONNECTION STORAGE
# ==================================================


class CollaborationRoom:
    def __init__(self) -> None:
        self.connections: dict[
            WebSocket,
            str,
        ] = {}


rooms: dict[str, CollaborationRoom] = {}


# ==================================================
# AUTHENTICATION
# ==================================================


def get_user_from_websocket(
    websocket: WebSocket,
) -> User | None:
    raw_token = websocket.cookies.get(
        "aegis_session"
    )

    if not raw_token:
        return None

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    db = SessionLocal()

    try:
        session = db.scalar(
            select(UserSession).where(
                UserSession.token_hash
                == token_hash,
            )
        )

        if not session:
            return None

        now = datetime.now(timezone.utc)

        if session.expires_at <= now:
            return None

        user = db.get(
            User,
            session.user_id,
        )

        if not user or not user.is_active:
            return None

        return user

    finally:
        db.close()


# ==================================================
# BOARD SERIALIZATION
# ==================================================


def get_board_state(
    session: CollaborationSession,
) -> dict[str, Any]:
    board_data = session.board_data or {}

    return {
        "elements": board_data.get(
            "elements",
            [],
        ),
        "pan": {
            "x": session.pan_x,
            "y": session.pan_y,
        },
        "canvasBackground": board_data.get(
            "canvasBackground",
            "#ffffff",
        ),
        "theme": board_data.get(
            "theme",
            "light",
        ),
    }


# ==================================================
# BROADCAST
# ==================================================


async def broadcast(
    session_id: str,
    message: dict[str, Any],
    exclude: WebSocket | None = None,
) -> None:
    room = rooms.get(session_id)

    if not room:
        return

    disconnected: list[WebSocket] = []

    for websocket in list(
        room.connections.keys()
    ):
        if websocket is exclude:
            continue

        try:
            await websocket.send_json(message)

        except Exception:
            disconnected.append(
                websocket
            )

    for websocket in disconnected:
        room.connections.pop(
            websocket,
            None,
        )


# ==================================================
# WEBSOCKET
# ==================================================


@router.websocket(
    "/api/collaboration/ws/{session_id}"
)
async def collaboration_websocket(
    websocket: WebSocket,
    session_id: str,
) -> None:

    user = get_user_from_websocket(
        websocket
    )

    if not user:
        await websocket.close(
            code=4001
        )
        return

    try:
        session_uuid = uuid.UUID(
            session_id
        )

    except ValueError:
        await websocket.close(
            code=4002
        )
        return

    db = SessionLocal()

    try:
        session = db.get(
            CollaborationSession,
            session_uuid,
        )

        if not session:
            await websocket.close(
                code=4004
            )
            return

        if session.status != "active":
            await websocket.close(
                code=4005
            )
            return

        # ------------------------------------------
        # DETERMINE PERMISSION
        # ------------------------------------------

        if user.id == session.started_by:
            permission = "write"

        else:
            participant = db.scalar(
                select(
                    CollaborationParticipant
                ).where(
                    CollaborationParticipant.session_id
                    == session.id,
                    CollaborationParticipant.employee_id
                    == user.id,
                    CollaborationParticipant.left_at
                    .is_(None),
                )
            )

            if not participant:
                await websocket.close(
                    code=4003
                )
                return

            if not participant.joined_at:
                await websocket.close(
                    code=4003
                )
                return

            permission = (
                participant.permission
            )

        # ------------------------------------------
        # ACCEPT CONNECTION
        # ------------------------------------------

        await websocket.accept()

        room_key = str(session.id)

        if room_key not in rooms:
            rooms[room_key] = (
                CollaborationRoom()
            )

        room = rooms[room_key]

        room.connections[
            websocket
        ] = permission

        # ------------------------------------------
        # SEND CURRENT BOARD STATE
        # ------------------------------------------

        await websocket.send_json(
            {
                "type": "collaboration:connected",
                "session_id": room_key,
                "permission": permission,
                "board": get_board_state(
                    session
                ),
            }
        )

        # ------------------------------------------
        # MESSAGE LOOP
        # ------------------------------------------

        while True:

            raw_message = (
                await websocket.receive_text()
            )

            try:
                message = json.loads(
                    raw_message
                )

            except json.JSONDecodeError:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": (
                            "Invalid message."
                        ),
                    }
                )
                continue

            message_type = message.get(
                "type"
            )

            # ======================================
            # BOARD UPDATE
            # ======================================

            if (
                message_type
                == "board:update"
            ):

                # READ users cannot modify
                # the shared board.
                if permission != "write":
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "You have READ-only "
                                "access."
                            ),
                        }
                    )
                    continue

                elements = message.get(
                    "elements"
                )

                pan = message.get(
                    "pan"
                )

                canvas_background = message.get(
                    "canvasBackground",
                    "#ffffff",
                )

                theme = message.get(
                    "theme",
                    "light",
                )

                # ----------------------------------
                # VALIDATE ELEMENTS
                # ----------------------------------

                if not isinstance(
                    elements,
                    list,
                ):
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Invalid elements."
                            ),
                        }
                    )
                    continue

                # ----------------------------------
                # VALIDATE PAN
                # ----------------------------------

                if not isinstance(
                    pan,
                    dict,
                ):
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Invalid pan."
                            ),
                        }
                    )
                    continue

                try:
                    pan_x = float(
                        pan.get(
                            "x",
                            0,
                        )
                    )

                    pan_y = float(
                        pan.get(
                            "y",
                            0,
                        )
                    )

                except (
                    TypeError,
                    ValueError,
                ):
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Invalid pan values."
                            ),
                        }
                    )
                    continue

                # ----------------------------------
                # VALIDATE CANVAS BACKGROUND
                # ----------------------------------

                if not isinstance(
                    canvas_background,
                    str,
                ):
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Invalid canvas background."
                            ),
                        }
                    )
                    continue

                # ----------------------------------
                # VALIDATE THEME
                # ----------------------------------

                if theme not in {
                    "light",
                    "dark",
                    "system",
                }:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Invalid theme."
                            ),
                        }
                    )
                    continue

                # ----------------------------------
                # SAVE CURRENT LIVE STATE
                # ----------------------------------

                session.board_data = {
                    "elements": elements,
                    "pan": {
                        "x": pan_x,
                        "y": pan_y,
                    },
                    "canvasBackground": (
                        canvas_background
                    ),
                    "theme": theme,
                }

                session.pan_x = pan_x
                session.pan_y = pan_y

                db.commit()

                # ----------------------------------
                # BROADCAST TO EVERYONE ELSE
                # ----------------------------------

                await broadcast(
                    room_key,
                    {
                        "type": "board:update",
                        "elements": elements,
                        "pan": {
                            "x": pan_x,
                            "y": pan_y,
                        },
                        "canvasBackground": (
                            canvas_background
                        ),
                        "theme": theme,
                        "updated_by": str(
                            user.id
                        ),
                    },
                    exclude=websocket,
                )

            # ======================================
            # PING
            # ======================================

            elif (
                message_type
                == "ping"
            ):
                await websocket.send_json(
                    {
                        "type": "pong"
                    }
                )

            # ======================================
            # UNKNOWN MESSAGE
            # ======================================

            else:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": (
                            "Unknown message type."
                        ),
                    }
                )

    except WebSocketDisconnect:

        room = rooms.get(
            str(session_uuid)
        )

        if room:
            room.connections.pop(
                websocket,
                None,
            )

            if not room.connections:
                rooms.pop(
                    str(session_uuid),
                    None,
                )

    except Exception:

        room = rooms.get(
            str(session_uuid)
        )

        if room:
            room.connections.pop(
                websocket,
                None,
            )

            if not room.connections:
                rooms.pop(
                    str(session_uuid),
                    None,
                )

    finally:
        db.close()