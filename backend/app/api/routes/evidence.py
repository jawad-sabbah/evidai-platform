from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, Form, Query, UploadFile, status

from app.api.dependencies import CaseMemberUser, DbSession
from app.core.enums import EvidenceProcessingStatus
from app.schemas.evidence import EvidenceResponse
from app.services.evidence_service import evidence_service

router = APIRouter(
    prefix="/cases/{case_id}/evidence",
    tags=["Evidence"],
)


@router.post(
    "",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_evidence(
    case_id: UUID,
    db: DbSession,
    current_user: CaseMemberUser,
    file: Annotated[UploadFile, File()],
    display_name: Annotated[str | None, Form()] = None,
    source_type: Annotated[str | None, Form()] = None,
    description: Annotated[str | None, Form()] = None,
) -> EvidenceResponse:
    return evidence_service.upload_evidence(
        db=db,
        case_id=case_id,
        uploaded_by=current_user.id,
        file=file,
        display_name=display_name,
        source_type=source_type,
        description=description,
    )


@router.get(
    "/{evidence_id}",
    response_model=EvidenceResponse,
    status_code=status.HTTP_200_OK,
)
def get_evidence_by_id(
    case_id: UUID,
    evidence_id: UUID,
    db: DbSession,
    current_user: CaseMemberUser,
) -> EvidenceResponse:
    return evidence_service.get_evidence_by_id(
        db=db,
        evidence_id=evidence_id,
    )


@router.get(
    "",
    response_model=list[EvidenceResponse],
    status_code=status.HTTP_200_OK,
)
def get_evidence_by_case(
    case_id: UUID,
    db: DbSession,
    current_user: CaseMemberUser,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    processing_status: Annotated[
        EvidenceProcessingStatus | None,
        Query(),
    ] = None,
) -> list[EvidenceResponse]:
    return evidence_service.get_evidence_by_case(
        db=db,
        case_id=case_id,
        limit=limit,
        offset=offset,
        processing_status=(
            processing_status.value if processing_status is not None else None
        ),
    )
