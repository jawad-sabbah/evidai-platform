import uuid
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class EntityMention(Base):
    __tablename__ = "entity_mentions"

    __table_args__ = (
        CheckConstraint(
            "confidence IS NULL OR confidence BETWEEN 0 AND 1",
            name="entity_mentions_confidence_check",
        ),
        Index(
            "idx_entity_mentions_entity",
            "entity_id",
        ),
        Index(
            "idx_entity_mentions_evidence",
            "evidence_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("entities.id", ondelete="CASCADE"),
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

    mention_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    start_offset: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    end_offset: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    confidence: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 4),
        nullable=True,
    )

    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
