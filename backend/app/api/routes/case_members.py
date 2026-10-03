from uuid import UUID

from fastapi import APIRouter, Response, status

from app.api.dependencies import CurrentUser, DbSession
from app.schemas.case_member import (
    CaseMemberCreate,
    CaseMemberResponse,
    CaseMemberUpdate,
)
from app.services.case_member_service import case_member_service

router = APIRouter(
    prefix="/cases/{case_id}/members",
    tags=["case-members"],
)


@router.get(
    "",
    response_model=list[CaseMemberResponse],
    status_code=status.HTTP_200_OK,
)
def list_case_members(case_id: UUID, db: DbSession, current_user: CurrentUser):
    return case_member_service.list_members(
        db=db,
        case_id=case_id,
    )


@router.post(
    "",
    response_model=CaseMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_case_member(
    case_id: UUID, payload: CaseMemberCreate, db: DbSession, current_user: CurrentUser
):
    return case_member_service.add_member(
        db=db,
        case_id=case_id,
        payload=payload,
    )


@router.patch(
    "/{member_id}",
    response_model=CaseMemberResponse,
    status_code=status.HTTP_200_OK,
)
def update_case_member(
    case_id: UUID,
    member_id: UUID,
    payload: CaseMemberUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    return case_member_service.update_member(
        db=db,
        case_id=case_id,
        member_id=member_id,
        payload=payload,
    )


@router.delete(
    "/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_case_member(
    case_id: UUID, member_id: UUID, db: DbSession, current_user: CurrentUser
) -> Response:
    case_member_service.delete_member(
        db=db,
        case_id=case_id,
        member_id=member_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
