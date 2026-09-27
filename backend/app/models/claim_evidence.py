import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class ClaimEvidence(Base):
    __tablename__ = "claim_evidence"

    __table_args__ = (
        CheckConstraint(
            """
            evidence_role IS NULL
            OR evidence_role IN ('SUPPORTS', 'CONTRADICTS', 'MENTIONS')
            """,
            name="claim_evidence_evidence_role_check",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    claim_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("claims.id", ondelete="CASCADE"),
        nullable=False,
    )

    evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence.id", ondelete="CASCADE"),
        nullable=False,
    )

    chunk_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence_chunks.id", ondelete="SET NULL"),
        nullable=True,
    )

    page_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence_pages.id", ondelete="SET NULL"),
        nullable=True,
    )

    evidence_role: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    supporting_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )