"""baseline existing schema

Revision ID: 61caf23e1e0b
Revises:
Create Date: 2026-09-27 16:21:29.955225

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "61caf23e1e0b"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
