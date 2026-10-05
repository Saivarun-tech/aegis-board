from uuid import UUID
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr
    employee_code: str | None
    role: str
    is_active: bool
    must_change_password: bool


class MessageResponse(BaseModel):
    message: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class FirstLoginRequest(BaseModel):
    current_password: str
    new_password: str
    email: EmailStr


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


# ==================================================
# EMPLOYEE MANAGEMENT
# ==================================================

class CreateEmployeeRequest(BaseModel):
    employee_code: str
    name: str
    email: EmailStr
    temporary_password: str


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employee_code: str | None
    name: str
    email: EmailStr
    role: str
    is_active: bool
    must_change_password: bool


# ==================================================
# WORK MANAGEMENT
# ==================================================

class CreateWorkRequest(BaseModel):
    employee_id: UUID
    title: str
    description: str = ""


class WorkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employee_id: UUID
    title: str
    description: str
    status: str
    created_by: UUID


# ==================================================
# COLLABORATION
# ==================================================


class CollaborationParticipantRequest(BaseModel):
    employee_id: UUID
    permission: Literal["read", "write"]


class CollaborationBoard(BaseModel):
    elements: list[dict[str, Any]] = Field(
        default_factory=list,
    )

    pan: dict[str, float] = Field(
        default_factory=lambda: {
            "x": 0.0,
            "y": 0.0,
        },
    )

    canvasBackground: str = "#ffffff"

    theme: Literal[
        "light",
        "dark",
        "system",
    ] = "light"


class StartCollaborationRequest(BaseModel):
    participants: list[CollaborationParticipantRequest]

    board: CollaborationBoard = Field(
        default_factory=CollaborationBoard,
    )


class CollaborationParticipantResponse(BaseModel):
    employee_id: UUID
    permission: str
    joined_at: datetime | None
    left_at: datetime | None


class CollaborationSessionResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    status: str
    started_by: UUID
    created_at: datetime

    participants: list[
        CollaborationParticipantResponse
    ]

    eligible: bool = False
    permission: str | None = None

    # Shared board snapshot
    board: CollaborationBoard | None = None