from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user, hash_password
from app.database import get_db
from app.models.user import User


router = APIRouter(
    prefix="/api/employees",
    tags=["Employees"],
)


class CreateEmployeeRequest(BaseModel):
    employee_code: str
    name: str
    email: EmailStr
    temporary_password: str


class EmployeeResponse(BaseModel):
    id: str
    employee_code: str
    name: str
    email: EmailStr
    role: str
    is_active: bool
    must_change_password: bool


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    payload: CreateEmployeeRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    employee_code = payload.employee_code.strip().upper()
    name = payload.name.strip()
    email = payload.email.strip().lower()

    if not employee_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee code is required.",
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
            detail="Employee code already exists.",
        )

    existing_email = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
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

    return EmployeeResponse(
        id=str(employee.id),
        employee_code=employee.employee_code,
        name=employee.name,
        email=employee.email,
        role=employee.role,
        is_active=employee.is_active,
        must_change_password=employee.must_change_password,
    )


@router.get(
    "",
    response_model=list[EmployeeResponse],
)
def list_employees(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    employees = db.scalars(
        select(User)
        .where(User.role == "employee")
        .order_by(User.created_at.asc())
    ).all()

    return [
        EmployeeResponse(
            id=str(employee.id),
            employee_code=employee.employee_code,
            name=employee.name,
            email=employee.email,
            role=employee.role,
            is_active=employee.is_active,
            must_change_password=employee.must_change_password,
        )
        for employee in employees
    ]