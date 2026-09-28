from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CaseNumberCounter(Base):
    __tablename__ = "case_number_counters"

    year: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    last_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )