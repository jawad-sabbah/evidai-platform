import uuid

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Case(Base):
    __tablename__ = "cases"

    __table_args__ = (
        CheckConstraint(
            "status IN ('OPEN', 'IN_REVIEW', 'CLOSED', 'ARCHIVED')",
            name="cases_status_check",
        ),
        CheckConstraint(
            """
            case_type IN (
                'FRAUD',
                'MONEY_LAUNDERING',
                'BRIBERY_CORRUPTION',
                'SANCTIONS',
                'TERRORIST_FINANCING',
                'CYBERCRIME',
                'ASSET_MISAPPROPRIATION',
                'PROCUREMENT_FRAUD',
                'INSIDER_THREAT',
                'COMPLIANCE_REVIEW',
                'INTERNAL_INVESTIGATION',
                'OTHER'
            )
            """,
            name="cases_case_type_check",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    case_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    case_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="OTHER",
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="OPEN",
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
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

    closed_at: Mapped[object | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )