import uuid

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, UniqueConstraint, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class CaseMember(Base):
    __tablename__ = "case_members"

    __table_args__ = (
        CheckConstraint(
            "case_role IN ('OWNER', 'INVESTIGATOR', 'REVIEWER', 'VIEWER')",
            name="case_members_case_role_check",
        ),
        UniqueConstraint(
            "case_id",
            "user_id",
            name="case_members_case_id_user_id_key",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    case_role: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )