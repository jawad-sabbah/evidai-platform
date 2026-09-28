from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import CaseStatus
from app.core.exceptions import (
    CaseNotFoundError,
    ConfigurationError,
    InvalidCaseTransitionError,
)
from app.models.case import Case
from app.repositories.case_repository import CaseRepository
from app.schemas.case import CaseCreate, CaseUpdate

class CaseService:
    def __init__(self, repository: CaseRepository) -> None:
        self.repository = repository

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
            case_number=self._generate_case_number(),
            title=payload.title,
            description=payload.description,
            case_type=payload.case_type,
            created_by=settings.dev_user_id,
        )

        try:
            self.repository.create(db, case)
            db.commit()
            db.refresh(case)
            return case
        except Exception:
            db.rollback()
            raise

    def update_case(
        self,
        db: Session,
        case_id: UUID,
        payload: CaseUpdate,
    ) -> Case:
        case = self.get_case(db, case_id)

        update_data = payload.model_dump(exclude_unset=True,mode="json")
        
        if "status" in update_data:
            self._validate_status_transition(
                current_status=CaseStatus(case.status),
                new_status=CaseStatus(update_data["status"]),
            )

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

    def _generate_case_number(self) -> str:
        from uuid import uuid4

        return f"CASE-{uuid4().hex[:8].upper()}"


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
    repository=CaseRepository(),
)