from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.case_member import CaseMember


class CaseMemberRepository:
    def create(
        self,
        db: Session,
        case_member: CaseMember,
    ) -> CaseMember:
        db.add(case_member)
        db.flush()
        return case_member

    def get_by_case_and_user(
        self,
        db: Session,
        case_id: UUID,
        user_id: UUID,
    ) -> CaseMember | None:
        statement = select(CaseMember).where(
            CaseMember.case_id == case_id,
            CaseMember.user_id == user_id,
        )

        return db.scalar(statement)
