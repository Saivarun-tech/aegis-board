import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CollaborationSession(Base):
    __tablename__ = "collaboration_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    started_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
    )

    # ==================================================
    # SHARED BOARD SNAPSHOT
    # ==================================================

    board_data: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    pan_x: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    pan_y: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # ==================================================
    # TIMESTAMPS
    # ==================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class CollaborationParticipant(Base):
    __tablename__ = "collaboration_participants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("collaboration_sessions.id"),
        nullable=False,
        index=True,
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    permission: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    joined_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    left_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )