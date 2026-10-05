"""create works table

Revision ID: c1a7dc670b27
Revises: 3a3589a022d0
Create Date: 2026-09-20 22:51:02.064420

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c1a7dc670b27"
down_revision: Union[str, Sequence[str], None] = "3a3589a022d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "works",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "employee_id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=200),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "created_by",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["employee_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_works_employee_id",
        "works",
        ["employee_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_works_employee_id",
        table_name="works",
    )

    op.drop_table("works")