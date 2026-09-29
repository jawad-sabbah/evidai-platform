from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import CaseStatus
from app.core.exceptions import (
    CaseConflictError,
    CaseNotFoundError,
    ConfigurationError,
    InvalidCaseTransitionError,
)
from app.models.case import Case
from app.models.case_member import CaseMember
from app.repositories.case_member_repository import CaseMemberRepository
from app.repositories.case_repository import CaseRepository
from app.schemas.case import CaseCreate, CaseUpdate


class CaseService:
    def __init__(
        self,
        repository: CaseRepository,
        case_member_repository: CaseMemberRepository,
    ) -> None:
        self.repository = repository
        self.case_member_repository = case_member_repository

    def list_cases(self, db: Session) -> list[Case]:
        return self.repository.get_all(db)

    def get_case(self, db: Session, case_id: UUID) -> Case:
        case = self.repository.get_by_id(db, case_id)

        if case is None:
            raise CaseNotFoundError("Case not found")

        return case

    def create_case(self, db: Session, payload: CaseCreate) -> Case:
        if settings.dev_user_id is None:
            raise ConfigurationError("DEV_USER_ID is not configured")

        case = Case(
            case_number=self._generate_case_number(db),
            title=payload.title,
            description=payload.description,
            case_type=payload.case_type,
            created_by=settings.dev_user_id,
        )

        try:
            # create the case
            self.repository.create(db, case)

            case_member = CaseMember(
                case_id=case.id,
                user_id=settings.dev_user_id,
                case_role="OWNER",
            )

            # create the case member after a case creation
            self.case_member_repository.create(db, case_member)

            db.commit()
            db.refresh(case)
            return case

        except IntegrityError as exc:
            db.rollback()
            raise CaseConflictError(
                "A case with this case number already exists"
            ) from exc

    def update_case(
        self,
        db: Session,
        case_id: UUID,
        payload: CaseUpdate,
    ) -> Case:
        case = self.get_case(db, case_id)

        update_data = payload.model_dump(exclude_unset=True, mode="json")

        if "status" in update_data:
            new_status = CaseStatus(update_data["status"])

            self._validate_status_transition(
                current_status=CaseStatus(case.status),
                new_status=new_status,
            )

            if new_status == CaseStatus.CLOSED:
                case.closed_at = datetime.now(UTC)

        for field, value in update_data.items():
            setattr(case, field, value)

        try:
            self.repository.create(db, case)
            db.commit()
            db.refresh(case)

            return case
        except Exception:
            db.rollback()

            raise

    def _generate_case_number(
        self,
        db: Session,
    ) -> str:
        year = datetime.now(UTC).year

        next_number = self.repository.get_next_case_number(
            db,
            year,
        )

        return f"CASE-{year}-{next_number:06d}"

    def _validate_status_transition(
        self,
        current_status: CaseStatus,
        new_status: CaseStatus,
    ) -> None:
        allowed_transitions = {
            CaseStatus.OPEN: {
                CaseStatus.IN_REVIEW,
                CaseStatus.CLOSED,
            },
            CaseStatus.IN_REVIEW: {
                CaseStatus.OPEN,
                CaseStatus.CLOSED,
            },
            CaseStatus.CLOSED: {
                CaseStatus.ARCHIVED,
            },
            CaseStatus.ARCHIVED: set(),
        }

        if new_status == current_status:
            return

        if new_status not in allowed_transitions[current_status]:
            raise InvalidCaseTransitionError(
                f"Cannot change case from {current_status} to {new_status}"
            )


case_service = CaseService(
    repository=CaseRepository(), case_member_repository=CaseMemberRepository()
)
