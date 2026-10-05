"""add employee management fields

Revision ID: 3a3589a022d0
Revises: df857ffadcc5
Create Date: 2026-09-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3a3589a022d0"
down_revision: Union[str, Sequence[str], None] = "df857ffadcc5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "employee_code",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_users_employee_code",
        "users",
        ["employee_code"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_users_employee_code",
        table_name="users",
    )

    op.drop_column(
        "users",
        "employee_code",
    )