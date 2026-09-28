"""add case number sequence

Revision ID: 6e3ea95d2777
Revises: 61caf23e1e0b
Create Date: 2026-09-28 17:37:07.012658

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6e3ea95d2777"
down_revision: str | Sequence[str] | None = "61caf23e1e0b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "case_number_counters",
        sa.Column(
            "year",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "last_number",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.PrimaryKeyConstraint("year"),
    )


def downgrade() -> None:
    op.drop_table("case_number_counters")
