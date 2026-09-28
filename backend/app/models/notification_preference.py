import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    __table_args__ = (
    Index(
        "idx_notification_preferences_user_id",
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

    evidence_failed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    evidence_ready: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    review_assigned: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    finding_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    report_ready: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    mentions: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    email_notifications: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    in_app_notifications: Mapped[bool] = mapped_column(
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