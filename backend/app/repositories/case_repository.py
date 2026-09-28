from uuid import UUID

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.case_number_counter import CaseNumberCounter


class CaseRepository:
    def get_all(self, db: Session) -> list[Case]:
        statement = select(Case).order_by(Case.created_at.desc())
        return list(db.scalars(statement).all())

    def get_by_id(self, db: Session, case_id: UUID) -> Case | None:
        statement = select(Case).where(Case.id == case_id)
        return db.scalar(statement)

    def get_by_case_number(
        self,
        db: Session,
        case_number: str,
    ) -> Case | None:
        statement = select(Case).where(Case.case_number == case_number)
        return db.scalar(statement)

    def create(self, db: Session, case: Case) -> Case:
        db.add(case)
        db.flush()
        return case

    def update(self, db: Session, case: Case) -> Case:
        db.flush()
        return case

    def get_next_case_number(
        self,
        db: Session,
        year: int,
    ) -> int:
        statement = (
            insert(CaseNumberCounter)
            .values(
                year=year,
                last_number=1,
            )
            .on_conflict_do_update(
                index_elements=[CaseNumberCounter.year],
                set_={
                    "last_number": CaseNumberCounter.last_number + 1,
                },
            )
            .returning(CaseNumberCounter.last_number)
        )

        return db.scalar(statement)
