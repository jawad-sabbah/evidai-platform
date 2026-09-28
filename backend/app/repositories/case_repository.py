from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.case import Case


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