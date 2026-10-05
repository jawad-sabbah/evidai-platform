from uuid import UUID

import pytest
from sqlalchemy import select

from app.core.config import settings
from app.core.enums import CaseType
from app.models.evidence import Evidence
from app.models.processing_job import ProcessingJob
from app.schemas.case import CaseCreate
from app.services.case_service import case_service
from app.services.storage_service import local_storage_service


@pytest.fixture
def evidence_case(db_session):
    return case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Evidence Upload Test Case",
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


def test_upload_evidence_success(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    response = client.post(
        f"/cases/{evidence_case.id}/evidence",
        headers=auth_headers,
        files={
            "file": (
                "report.txt",
                b"Evidence document content",
                "text/plain",
            )
        },
        data={
            "display_name": "Test Report",
            "source_type": "UPLOAD",
            "description": "Test evidence",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["case_id"] == str(evidence_case.id)
    assert data["uploaded_by"] == str(settings.dev_user_id)
    assert data["original_filename"] == "report.txt"
    assert data["display_name"] == "Test Report"
    assert data["file_type"] == "txt"
    assert data["mime_type"] == "text/plain"
    assert data["source_type"] == "UPLOAD"
    assert data["description"] == "Test evidence"
    assert data["processing_status"] == "QUEUED"

    evidence = db_session.get(
        Evidence,
        UUID(data["id"]),
    )

    assert evidence is not None
    assert evidence.case_id == evidence_case.id
    assert evidence.uploaded_by == settings.dev_user_id
    assert evidence.processing_status == "QUEUED"
    assert evidence.file_size == len(b"Evidence document content")
    assert evidence.checksum is not None
    assert evidence.storage_key is not None


def test_upload_evidence_creates_processing_job(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    response = client.post(
        f"/cases/{evidence_case.id}/evidence",
        headers=auth_headers,
        files={
            "file": (
                "document.txt",
                b"Evidence content",
                "text/plain",
            )
        },
    )

    assert response.status_code == 201

    evidence_id = UUID(response.json()["id"])

    statement = select(ProcessingJob).where(ProcessingJob.evidence_id == evidence_id)

    processing_job = db_session.scalar(statement)

    assert processing_job is not None
    assert processing_job.case_id == evidence_case.id
    assert processing_job.evidence_id == evidence_id
    assert processing_job.status == "QUEUED"
    assert processing_job.job_type == "FULL_DOCUMENT_PROCESSING"
    assert processing_job.attempt_count == 0
    assert processing_job.max_attempts == 3


def test_upload_evidence_without_authentication(
    client,
    evidence_case,
):
    response = client.post(
        f"/cases/{evidence_case.id}/evidence",
        files={
            "file": (
                "report.txt",
                b"Evidence content",
                "text/plain",
            )
        },
    )

    assert response.status_code == 401


def test_upload_evidence_without_file(
    client,
    auth_headers,
    evidence_case,
):
    response = client.post(
        f"/cases/{evidence_case.id}/evidence",
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_non_member_cannot_upload_evidence(
    client,
    db_session,
    evidence_case,
):
    from app.core.security import create_access_token
    from app.models.user import User

    user = User(
        full_name="Evidence Non Member",
        email="evidence-non-member@example.com",
        password_hash="TEST_ONLY",
        system_role="USER",
        status="ACTIVE",
    )

    db_session.add(user)
    db_session.flush()

    token = create_access_token(user.id)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    response = client.post(
        f"/cases/{evidence_case.id}/evidence",
        headers=headers,
        files={
            "file": (
                "report.txt",
                b"Unauthorized evidence",
                "text/plain",
            )
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "You are not a member of this case"
