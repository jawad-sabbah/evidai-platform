from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.enums import CaseRole
from app.core.exceptions import (
    CaseMemberAlreadyExistsError,
    CaseMemberNotFoundError,
    CaseNotFoundError,
    LastOwnerError,
    UserNotFoundError,
)
from app.models.case_member import CaseMember
from app.repositories.case_member_repository import CaseMemberRepository
from app.repositories.case_repository import CaseRepository
from app.repositories.user_repository import UserRepository
from app.schemas.case_member import CaseMemberCreate, CaseMemberUpdate


class CaseMemberService:
    def __init__(
        self,
        repository: CaseMemberRepository,
        case_repository: CaseRepository,
        user_repository: UserRepository,
    ) -> None:
        self.repository = repository
        self.case_repository = case_repository
        self.user_repository = user_repository

    def list_members(
        self,
        db: Session,
        case_id: UUID,
    ) -> list[CaseMember]:
        self._ensure_case_exists(db, case_id)

        return self.repository.list_by_case(db, case_id)

    def add_member(
        self,
        db: Session,
        case_id: UUID,
        payload: CaseMemberCreate,
    ) -> CaseMember:
        self._ensure_case_exists(db, case_id)
        self._ensure_user_exists(db, payload.user_id)

        existing_member = self.repository.get_by_case_and_user(
            db,
            case_id,
            payload.user_id,
        )

        if existing_member is not None:
            raise CaseMemberAlreadyExistsError("User is already a member of this case")

        case_member = CaseMember(
            case_id=case_id,
            user_id=payload.user_id,
            case_role=payload.case_role.value,
        )

        try:
            self.repository.create(db, case_member)
            db.commit()
            db.refresh(case_member)

            return case_member
        except IntegrityError as exc:
            db.rollback()
            raise CaseMemberAlreadyExistsError(
                "User is already a member of this case"
            ) from exc
        except Exception:
            db.rollback()
            raise

    def update_member(
        self,
        db: Session,
        case_id: UUID,
        member_id: UUID,
        payload: CaseMemberUpdate,
    ) -> CaseMember:
        self._ensure_case_exists(db, case_id)

        member = self._get_case_member(
            db,
            case_id,
            member_id,
        )

        if (
            member.case_role == CaseRole.OWNER.value
            and payload.case_role != CaseRole.OWNER
        ):
            self._ensure_not_last_owner(db, case_id)

        member.case_role = payload.case_role.value

        try:
            self.repository.update(db, member)
            db.commit()
            db.refresh(member)

            return member
        except Exception:
            db.rollback()
            raise

    def delete_member(
        self,
        db: Session,
        case_id: UUID,
        member_id: UUID,
    ) -> None:
        self._ensure_case_exists(db, case_id)

        member = self._get_case_member(
            db,
            case_id,
            member_id,
        )

        if member.case_role == CaseRole.OWNER.value:
            self._ensure_not_last_owner(db, case_id)

        try:
            self.repository.delete(db, member)
            db.commit()
        except Exception:
            db.rollback()
            raise

    def _ensure_case_exists(
        self,
        db: Session,
        case_id: UUID,
    ) -> None:
        if self.case_repository.get_by_id(db, case_id) is None:
            raise CaseNotFoundError("Case not found")

    def _ensure_user_exists(
        self,
        db: Session,
        user_id: UUID,
    ) -> None:
        if self.user_repository.get_by_id(db, user_id) is None:
            raise UserNotFoundError("User not found")

    def _get_case_member(
        self,
        db: Session,
        case_id: UUID,
        member_id: UUID,
    ) -> CaseMember:
        member = self.repository.get_by_id(db, member_id)

        if member is None or member.case_id != case_id:
            raise CaseMemberNotFoundError("Case member not found")

        return member

    def _ensure_not_last_owner(
        self,
        db: Session,
        case_id: UUID,
    ) -> None:
        if self.repository.count_owners(db, case_id) <= 1:
            raise LastOwnerError(
                "The last owner of a case cannot be removed or demoted"
            )


case_member_service = CaseMemberService(
    repository=CaseMemberRepository(),
    case_repository=CaseRepository(),
    user_repository=UserRepository(),
)
