"""add collaboration board snapshot

Revision ID: b6d4e8f0c3a1
Revises: 47fb4174
Create Date: 2026-09-23
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "b6d4e8f0c3a1"
down_revision: Union[str, Sequence[str], None] = "47fb4174"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "collaboration_sessions",
        sa.Column(
            "board_data",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )

    op.add_column(
        "collaboration_sessions",
        sa.Column(
            "pan_x",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "collaboration_sessions",
        sa.Column(
            "pan_y",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )


def downgrade() -> None:
    op.drop_column("collaboration_sessions", "pan_y")
    op.drop_column("collaboration_sessions", "pan_x")
    op.drop_column("collaboration_sessions", "board_data")