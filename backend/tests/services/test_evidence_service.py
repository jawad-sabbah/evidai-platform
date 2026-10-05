from io import BytesIO

import pytest
from fastapi import UploadFile
from sqlalchemy import select

from app.core.config import settings
from app.core.enums import CaseType
from app.models.evidence import Evidence
from app.models.processing_job import ProcessingJob
from app.schemas.case import CaseCreate
from app.services.case_service import case_service
from app.services.evidence_service import evidence_service
from app.services.storage_service import local_storage_service


@pytest.fixture
def evidence_case(db_session):
    return case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Evidence Service Test Case",
            case_type=CaseType.OTHER,
        ),
        created_by=settings.dev_user_id,
    )


@pytest.fixture(autouse=True)
def use_test_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(
        local_storage_service,
        "base_dir",
        tmp_path / "evidence",
    )


def make_upload_file(
    filename: str = "document.txt",
    content: bytes = b"Test evidence content",
    content_type: str = "text/plain",
) -> UploadFile:
    return UploadFile(
        filename=filename,
        file=BytesIO(content),
        headers={"content-type": content_type},
    )


def test_upload_evidence_creates_evidence(
    db_session,
    evidence_case,
):
    file = make_upload_file()

    evidence = evidence_service.upload_evidence(
        db=db_session,
        case_id=evidence_case.id,
        uploaded_by=settings.dev_user_id,
        file=file,
        display_name="Service Test",
        source_type="UPLOAD",
        description="Evidence service test",
    )

    assert evidence.id is not None
    assert evidence.case_id == evidence_case.id
    assert evidence.uploaded_by == settings.dev_user_id

    assert evidence.original_filename == "document.txt"
    assert evidence.display_name == "Service Test"
    assert evidence.file_type == "txt"
    assert evidence.mime_type == "text/plain"

    assert evidence.source_type == "UPLOAD"
    assert evidence.description == "Evidence service test"

    assert evidence.processing_status == "QUEUED"

    stored_evidence = db_session.get(
        Evidence,
        evidence.id,
    )

    assert stored_evidence is not None


def test_upload_evidence_stores_file_metadata(
    db_session,
    evidence_case,
):
    content = b"Evidence file content"

    file = make_upload_file(
        filename="report.txt",
        content=content,
    )

    evidence = evidence_service.upload_evidence(
        db=db_session,
        case_id=evidence_case.id,
        uploaded_by=settings.dev_user_id,
        file=file,
    )

    assert evidence.file_size == len(content)
    assert evidence.checksum is not None
    assert evidence.storage_key is not None

    stored_path = local_storage_service.base_dir.parent / evidence.storage_key

    assert stored_path.exists()


def test_upload_evidence_creates_processing_job(
    db_session,
    evidence_case,
):
    file = make_upload_file()

    evidence = evidence_service.upload_evidence(
        db=db_session,
        case_id=evidence_case.id,
        uploaded_by=settings.dev_user_id,
        file=file,
    )

    statement = select(ProcessingJob).where(ProcessingJob.evidence_id == evidence.id)

    processing_job = db_session.scalar(statement)

    assert processing_job is not None
    assert processing_job.case_id == evidence_case.id
    assert processing_job.evidence_id == evidence.id
    assert processing_job.status == "QUEUED"
    assert processing_job.job_type == "FULL_DOCUMENT_PROCESSING"
    assert processing_job.attempt_count == 0
    assert processing_job.max_attempts == 3
