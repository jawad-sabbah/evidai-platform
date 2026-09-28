import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Claim(Base):
    __tablename__ = "claims"

    __table_args__ = (
        CheckConstraint(
            "status IN ('UNVERIFIED', 'SUPPORTED', 'CONTRADICTED', 'DISPUTED', 'VERIFIED')",
            name="claims_status_check",
        ),
        CheckConstraint(
            "confidence IS NULL OR confidence BETWEEN 0 AND 1",
            name="claims_confidence_check",
        ),
        Index(
            "idx_claims_case",
            "case_id",
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

    claim_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    claim_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    speaker_entity_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("entities.id", ondelete="SET NULL"),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="UNVERIFIED",
    )

    confidence: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 4),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
