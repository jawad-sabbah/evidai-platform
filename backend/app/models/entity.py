import uuid
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


class Entity(Base):
    __tablename__ = "entities"

    __table_args__ = (
        CheckConstraint(
            "confidence IS NULL OR confidence BETWEEN 0 AND 1",
            name="entities_confidence_check",
        ),
        CheckConstraint(
            "review_status IN ('UNREVIEWED', 'CONFIRMED', 'REJECTED', 'MERGED')",
            name="entities_review_status_check",
        ),
        Index(
            "idx_entities_case_id",
            "case_id",
        ),
        Index(
            "idx_entities_type",
            "case_id",
            "entity_type",
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

    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    canonical_name: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    normalized_value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    confidence: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 4),
        nullable=True,
    )

    review_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="UNREVIEWED",
    )

    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[object] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
