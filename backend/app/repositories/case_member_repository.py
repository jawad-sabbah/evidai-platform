from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import CaseRole
from app.models.case_member import CaseMember


class CaseMemberRepository:
    def list_by_case(
        self,
        db: Session,
        case_id: UUID,
    ) -> list[CaseMember]:
        statement = (
            select(CaseMember)
            .where(CaseMember.case_id == case_id)
            .order_by(CaseMember.created_at.asc())
        )

        return list(db.scalars(statement).all())

    def get_by_id(
        self,
        db: Session,
        member_id: UUID,
    ) -> CaseMember | None:
        statement = select(CaseMember).where(CaseMember.id == member_id)

        return db.scalar(statement)

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

    def create(
        self,
        db: Session,
        case_member: CaseMember,
    ) -> CaseMember:
        db.add(case_member)
        db.flush()
        return case_member

    def update(
        self,
        db: Session,
        case_member: CaseMember,
    ) -> CaseMember:
        db.flush()
        return case_member

    def delete(
        self,
        db: Session,
        case_member: CaseMember,
    ) -> None:
        db.delete(case_member)
        db.flush()

    def count_owners(
        self,
        db: Session,
        case_id: UUID,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(CaseMember)
            .where(
                CaseMember.case_id == case_id,
                CaseMember.case_role == CaseRole.OWNER.value,
            )
        )

        return db.scalar(statement) or 0
