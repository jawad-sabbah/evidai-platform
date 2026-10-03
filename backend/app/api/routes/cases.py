from uuid import UUID

from fastapi import APIRouter, status

from app.api.dependencies import CurrentUser, DbSession
from app.schemas.case import CaseCreate, CaseResponse, CaseUpdate
from app.services.case_service import case_service

router = APIRouter(
    prefix="/cases",
    tags=["cases"],
)


@router.get(
    "",
    response_model=list[CaseResponse],
    status_code=status.HTTP_200_OK,
)
def list_cases(db: DbSession, current_user: CurrentUser):
    return case_service.list_cases(db)


@router.post(
    "",
    response_model=CaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_case(payload: CaseCreate, db: DbSession, current_user: CurrentUser):
    return case_service.create_case(db=db, payload=payload, created_by=current_user.id)


@router.get(
    "/{case_id}",
    response_model=CaseResponse,
    status_code=status.HTTP_200_OK,
)
def get_case(case_id: UUID, db: DbSession, current_user: CurrentUser):
    return case_service.get_case(
        db=db,
        case_id=case_id,
    )


@router.patch(
    "/{case_id}",
    response_model=CaseResponse,
    status_code=status.HTTP_200_OK,
)
def update_case(
    case_id: UUID, payload: CaseUpdate, db: DbSession, current_user: CurrentUser
):
    return case_service.update_case(
        db=db,
        case_id=case_id,
        payload=payload,
    )
