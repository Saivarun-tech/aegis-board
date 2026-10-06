from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Response,
    status,
    
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    SESSION_COOKIE_NAME,
    create_session,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.collaboration_ws import broadcast
from app.models.session import UserSession
from app.models.user import User
from app.models.work import Work
from app.models.collaboration import (
    CollaborationSession,
    CollaborationParticipant,
)

from app.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    UpdateProfileRequest,
    FirstLoginRequest,
    UserResponse,
    CreateEmployeeRequest,
    EmployeeResponse,
    CreateWorkRequest,
    WorkResponse,
    CollaborationBoard,
    CollaborationParticipantResponse,
    CollaborationSessionResponse,
    StartCollaborationRequest,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)
work_router = APIRouter(
    prefix="/api/works",
    tags=["Work Management"],
)
collaboration_router = APIRouter(
    prefix="/api/collaboration",
    tags=["Collaboration"],
)
@router.post(
    "/login",
    response_model=UserResponse,
)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(
            User.email == str(payload.email).lower()
        )
    )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    session_token = create_session(
        db,
        user,
    )

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

    return user


@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    user: User = Depends(get_current_user),
):
    return user


@router.post(
    "/logout",
    response_model=MessageResponse,
)
def logout(
    response: Response,
    aegis_session: str | None = Cookie(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if aegis_session:
        import hashlib

        token_hash = hashlib.sha256(
            aegis_session.encode("utf-8")
        ).hexdigest()

        session = db.scalar(
            select(UserSession).where(
                UserSession.token_hash == token_hash
            )
        )

        if session:
            db.delete(session)
            db.commit()

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
    )

    return {
        "message": "Logged out successfully."
    }


@router.post(
    "/change-password",
    response_model=MessageResponse,
)
def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(
        payload.current_password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters.",
        )

    user.password_hash = hash_password(
        payload.new_password
    )

    user.must_change_password = False

    db.commit()

    return {
        "message": "Password changed successfully."
    }


@router.post(
    "/first-login",
    response_model=UserResponse,
)
def first_login_setup(
    payload: FirstLoginRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="First-login setup is not required.",
        )

    if not verify_password(
        payload.current_password,
        current_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters.",
        )

    email = payload.email.strip().lower()

    existing_email = db.scalar(
        select(User).where(
            User.email == email,
            User.id != current_user.id,
        )
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
        )

    current_user.email = email
    current_user.password_hash = hash_password(
        payload.new_password
    )
    current_user.must_change_password = False

    db.commit()
    db.refresh(current_user)

    return current_user


@router.patch(
    "/profile",
    response_model=UserResponse,
)
def update_profile(
    payload: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        name = payload.name.strip()

        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name cannot be empty.",
            )

        user.name = name

    if payload.email is not None:
        new_email = str(payload.email).lower()

        existing_user = db.scalar(
            select(User).where(
                User.email == new_email,
                User.id != user.id,
            )
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already in use.",
            )

        user.email = new_email

    db.commit()
    db.refresh(user)

    return user


# ==================================================
# EMPLOYEE MANAGEMENT
# ==================================================

@router.get(
    "/../employees",
    response_model=list[EmployeeResponse],
)
def list_employees(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    employees = db.scalars(
        select(User)
        .where(User.role == "employee")
        .order_by(User.employee_code)
    ).all()

    return employees


@router.post(
    "/../employees",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    payload: CreateEmployeeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    employee_code = payload.employee_code.strip().upper()
    name = payload.name.strip()
    email = str(payload.email).strip().lower()

    if not employee_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID is required.",
        )

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee name is required.",
        )

    if len(payload.temporary_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Temporary password must be at least 8 characters.",
        )

    existing_code = db.scalar(
        select(User).where(
            User.employee_code == employee_code
        )
    )

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee ID already exists.",
        )

    existing_email = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already in use.",
        )

    employee = User(
        name=name,
        email=email,
        employee_code=employee_code,
        password_hash=hash_password(
            payload.temporary_password
        ),
        role="employee",
        is_active=True,
        must_change_password=True,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee
@router.delete(
    "/../employees",
    response_model=MessageResponse,
)
def delete_all_employees(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only the admin can perform this operation.
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    # Get all employee accounts.
    employees = db.scalars(
        select(User).where(
            User.role == "employee"
        )
    ).all()

    employee_ids = [
        employee.id
        for employee in employees
    ]

    if not employee_ids:
        return {
            "message": "No employee accounts found."
        }

    # ------------------------------------------
    # Delete collaboration participants
    # belonging to these employees
    # ------------------------------------------

    participants = db.scalars(
        select(CollaborationParticipant).where(
            CollaborationParticipant.employee_id.in_(
                employee_ids
            )
        )
    ).all()

    for participant in participants:
        db.delete(participant)

    # ------------------------------------------
    # Delete work assigned to these employees
    # ------------------------------------------

    works = db.scalars(
        select(Work).where(
            Work.employee_id.in_(
                employee_ids
            )
        )
    ).all()

    for work in works:
        db.delete(work)

    # ------------------------------------------
    # Delete employee login sessions
    # ------------------------------------------

    sessions = db.scalars(
        select(UserSession).where(
            UserSession.user_id.in_(
                employee_ids
            )
        )
    ).all()

    for session in sessions:
        db.delete(session)

    # ------------------------------------------
    # Delete employee accounts
    # ------------------------------------------

    for employee in employees:
        db.delete(employee)

    db.commit()

    return {
        "message": (
            f"Deleted {len(employees)} "
            "employee account(s) successfully."
        )
    }

# ==================================================
# WORK MANAGEMENT
# ==================================================

@work_router.post(
    "/",
    response_model=WorkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_work(
    payload: CreateWorkRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    title = payload.title.strip()
    description = payload.description.strip()

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Work title is required.",
        )

    employee = db.scalar(
        select(User).where(
            User.id == payload.employee_id,
            User.role == "employee",
            User.is_active.is_(True),
        )
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active employee not found.",
        )

    work = Work(
        employee_id=employee.id,
        title=title,
        description=description,
        status="assigned",
        created_by=current_user.id,
    )

    db.add(work)
    db.commit()
    db.refresh(work)

    return work


@work_router.get(
    "/",
    response_model=list[WorkResponse],
)
def list_my_works(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        works = db.scalars(
            select(Work)
            .order_by(Work.created_at.desc())
        ).all()

        return works

    works = db.scalars(
        select(Work)
        .where(
            Work.employee_id == current_user.id
        )
        .order_by(Work.created_at.desc())
    ).all()

    return works


# ==================================================
# LIVE COLLABORATION
# ==================================================


def get_active_collaboration_session(
    db: Session,
) -> CollaborationSession | None:
    return db.scalar(
        select(CollaborationSession)
        .where(
            CollaborationSession.status == "active"
        )
        .order_by(
            CollaborationSession.created_at.desc()
        )
    )

def build_collaboration_response(
    db: Session,
    session: CollaborationSession,
) -> CollaborationSessionResponse:
    participants = db.scalars(
        select(CollaborationParticipant).where(
            CollaborationParticipant.session_id == session.id,
        )
    ).all()

    board_data = session.board_data or {}

    return CollaborationSessionResponse(
        id=session.id,
        status=session.status,
        started_by=session.started_by,
        created_at=session.created_at,
        participants=[
            CollaborationParticipantResponse(
                employee_id=participant.employee_id,
                permission=participant.permission,
                joined_at=participant.joined_at,
                left_at=participant.left_at,
            )
            for participant in participants
        ],
        board=CollaborationBoard(
            elements=board_data.get(
                "elements",
                [],
            ),
            pan={
                "x": session.pan_x,
                "y": session.pan_y,
            },
            canvasBackground=board_data.get(
                "canvasBackground",
                "#ffffff",
            ),
            theme=board_data.get(
                "theme",
                "light",
            ),
        ),
    )


@collaboration_router.get(
    "/active",
    response_model=CollaborationSessionResponse | None,
)
def get_active_collaboration(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = get_active_collaboration_session(db)

    if session is None:
        return None

    # --------------------------------------------------
    # ADMIN
    # --------------------------------------------------
    # Admin can see the complete collaboration session.
    if current_user.role == "admin":
        response = build_collaboration_response(
            db,
            session,
        )

        response.eligible = True
        response.permission = "write"

        return response

    # --------------------------------------------------
    # EMPLOYEE
    # --------------------------------------------------

    participant = db.scalar(
        select(CollaborationParticipant)
        .where(
            CollaborationParticipant.session_id == session.id,
            CollaborationParticipant.employee_id == current_user.id,
        )
    )

    # Employee is NOT invited.
    # We still tell them that a collaboration exists,
    # but we do not expose the participant list.
    if participant is None:
        return CollaborationSessionResponse(
            id=session.id,
            status=session.status,
            started_by=session.started_by,
            created_at=session.created_at,
            participants=[],
            eligible=False,
            permission=None,
        )

    # Employee IS invited.
    return CollaborationSessionResponse(
        id=session.id,
        status=session.status,
        started_by=session.started_by,
        created_at=session.created_at,
        participants=[],
        eligible=True,
        permission=participant.permission,
    )


@collaboration_router.post(
    "/start",
    response_model=CollaborationSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def start_collaboration(
    payload: StartCollaborationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only admin can start collaboration.
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    # Only one collaboration session can be active.
    existing_session = get_active_collaboration_session(
        db
    )

    if existing_session is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A collaboration session is already active.",
        )

    if not payload.participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one employee must be selected.",
        )

    employee_ids = [
        participant.employee_id
        for participant in payload.participants
    ]

    # Prevent duplicate employee selections.
    if len(employee_ids) != len(set(employee_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee cannot be selected more than once.",
        )

    # Only active employees can participate.
    employees = db.scalars(
        select(User).where(
            User.id.in_(employee_ids),
            User.role == "employee",
            User.is_active.is_(True),
        )
    ).all()

    employee_map = {
        employee.id: employee
        for employee in employees
    }

    missing_ids = [
        employee_id
        for employee_id in employee_ids
        if employee_id not in employee_map
    ]

    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more selected employees are invalid or inactive.",
        )

    # Permission is already validated by Pydantic,
    # but keep the backend validation explicit.
    for participant in payload.participants:
        if participant.permission not in {
            "read",
            "write",
        }:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission must be 'read' or 'write'.",
            )

    session = CollaborationSession(
        started_by=current_user.id,
        status="active",
        board_data=payload.board.model_dump(),
        pan_x=payload.board.pan["x"],
        pan_y=payload.board.pan["y"],
    )

    db.add(session)
    db.flush()

    for participant in payload.participants:
        collaboration_participant = CollaborationParticipant(
            session_id=session.id,
            employee_id=participant.employee_id,
            permission=participant.permission,
        )

        db.add(collaboration_participant)

    db.commit()
    db.refresh(session)

    return build_collaboration_response(
        db,
        session,
    )


@collaboration_router.post(
    "/end",
    response_model=CollaborationSessionResponse,
)
async def end_collaboration(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    session = get_active_collaboration_session(db)

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active collaboration session.",
        )

    from datetime import datetime, timezone

    session.status = "ended"
    session.ended_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)

    # Notify every connected collaboration client.
    await broadcast(
        str(session.id),
        {
            "type": "collaboration:ended",
        },
    )

    return build_collaboration_response(
        db,
        session,
    )

@collaboration_router.post(
    "/join",
    response_model=CollaborationSessionResponse,
)
def join_collaboration(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can join a collaboration session.",
        )

    session = get_active_collaboration_session(db)

    print(
        "\n========== COLLABORATION JOIN DEBUG =========="
    )
    print("Current user ID:", current_user.id)
    print("Current user name:", current_user.name)
    print("Current user employee code:", current_user.employee_code)
    print("Active session ID:", session.id if session else None)

    if session is None:
        print("RESULT: No active session")
        print("==============================================\n")

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active collaboration session.",
        )

    participants = db.scalars(
        select(CollaborationParticipant)
        .where(
            CollaborationParticipant.session_id == session.id,
        )
    ).all()

    print("Participants in active session:")

    for participant_item in participants:
        print(
            "  participant employee_id:",
            participant_item.employee_id,
            "| permission:",
            participant_item.permission,
        )

    participant = db.scalar(
        select(CollaborationParticipant)
        .where(
            CollaborationParticipant.session_id == session.id,
            CollaborationParticipant.employee_id == current_user.id,
        )
    )

    print(
        "Matched participant:",
        participant.employee_id if participant else None,
    )

    if participant is None:
        print("RESULT: EMPLOYEE NOT FOUND IN PARTICIPANTS")
        print("==============================================\n")

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not invited to this collaboration session.",
        )

    from datetime import datetime, timezone

    participant.joined_at = datetime.now(timezone.utc)
    participant.left_at = None

    db.commit()

    print("RESULT: JOIN SUCCESS")
    print("Permission:", participant.permission)
    print("==============================================\n")

    response = build_collaboration_response(
        db,
        session,
    )

    response.eligible = True
    response.permission = participant.permission

    return response


@collaboration_router.post(
    "/leave",
    response_model=CollaborationSessionResponse,
)
def leave_collaboration(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can leave a collaboration session.",
        )

    session = get_active_collaboration_session(db)

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active collaboration session.",
        )

    participant = db.scalar(
        select(CollaborationParticipant)
        .where(
            CollaborationParticipant.session_id == session.id,
            CollaborationParticipant.employee_id == current_user.id,
        )
    )

    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this collaboration session.",
        )

    from datetime import datetime, timezone

    participant.left_at = datetime.now(timezone.utc)

    db.commit()

    return build_collaboration_response(
        db,
        session,
    )