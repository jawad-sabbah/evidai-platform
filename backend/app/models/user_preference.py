import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Index, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"

    __table_args__ = (
        CheckConstraint(
            "theme IN ('LIGHT', 'DARK', 'SYSTEM')",
            name="user_preferences_theme_check",
        ),
        CheckConstraint(
            "default_landing_page IN ('DASHBOARD', 'CASES', 'EVIDENCE', 'AI_INVESTIGATOR')",
            name="user_preferences_default_landing_page_check",
        ),
        CheckConstraint(
            "ai_response_style IN ('CONCISE', 'BALANCED', 'DETAILED')",
            name="user_preferences_ai_response_style_check",
        ),
        Index(
        "idx_user_preferences_user_id",
        "user_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    theme: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="LIGHT",
    )

    timezone: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        server_default="UTC",
    )

    date_format: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="DD/MM/YYYY",
    )

    default_landing_page: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="DASHBOARD",
    )

    ai_response_style: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="BALANCED",
    )

    ai_show_citations: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    ai_show_confidence: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
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