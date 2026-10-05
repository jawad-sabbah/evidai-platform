from pathlib import Path
from uuid import UUID, uuid4

import pytest
from sqlalchemy import select

from app.core.config import settings
from app.core.enums import CaseType
from app.core.security import create_access_token
from app.models.evidence import Evidence
from app.models.processing_job import ProcessingJob
from app.models.user import User
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


def upload_test_evidence(
    client,
    auth_headers,
    case_id,
    filename="report.txt",
    content=b"Evidence content",
):
    response = client.post(
        f"/cases/{case_id}/evidence",
        headers=auth_headers,
        files={
            "file": (
                filename,
                content,
                "text/plain",
            )
        },
    )

    assert response.status_code == 201

    return response.json()


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


def test_get_evidence_by_id(
    client,
    auth_headers,
    evidence_case,
):
    uploaded = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
    )

    response = client.get(
        f"/cases/{evidence_case.id}/evidence/{uploaded['id']}",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == uploaded["id"]
    assert data["case_id"] == str(evidence_case.id)
    assert data["original_filename"] == "report.txt"
    assert data["processing_status"] == "QUEUED"


def test_get_evidence_by_case(
    client,
    auth_headers,
    evidence_case,
):
    first = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
        filename="first.txt",
    )

    second = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
        filename="second.txt",
    )

    response = client.get(
        f"/cases/{evidence_case.id}/evidence",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    ids = {item["id"] for item in data}

    assert first["id"] in ids
    assert second["id"] in ids


def test_get_evidence_by_id_not_found(
    client,
    auth_headers,
    evidence_case,
):
    response = client.get(
        f"/cases/{evidence_case.id}/evidence/{uuid4()}",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Evidence not found"


def test_get_evidence_with_invalid_processing_status(
    client,
    auth_headers,
    evidence_case,
):
    response = client.get(
        f"/cases/{evidence_case.id}/evidence",
        headers=auth_headers,
        params={
            "processing_status": "INVALID",
        },
    )

    assert response.status_code == 422


def test_get_evidence_filters_by_processing_status(
    client,
    auth_headers,
    evidence_case,
):
    uploaded = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
    )

    response = client.get(
        f"/cases/{evidence_case.id}/evidence",
        headers=auth_headers,
        params={
            "processing_status": "QUEUED",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert any(item["id"] == uploaded["id"] for item in data)

    assert all(item["processing_status"] == "QUEUED" for item in data)


def test_get_evidence_pagination(
    client,
    auth_headers,
    evidence_case,
):
    for index in range(3):
        upload_test_evidence(
            client,
            auth_headers,
            evidence_case.id,
            filename=f"document-{index}.txt",
        )

    response = client.get(
        f"/cases/{evidence_case.id}/evidence",
        headers=auth_headers,
        params={
            "limit": 2,
            "offset": 0,
        },
    )

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_evidence_from_another_case_returns_not_found(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    other_case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Other Evidence Case",
            case_type=CaseType.OTHER,
        ),
        created_by=settings.dev_user_id,
    )

    uploaded = upload_test_evidence(
        client,
        auth_headers,
        other_case.id,
    )

    response = client.get(
        f"/cases/{evidence_case.id}/evidence/{uploaded['id']}",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Evidence not found"


def test_owner_can_delete_evidence(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    uploaded = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
    )

    evidence_id = UUID(uploaded["id"])

    response = client.delete(
        f"/cases/{evidence_case.id}/evidence/{evidence_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    evidence = db_session.get(Evidence, evidence_id)

    assert evidence is None


def test_delete_evidence_removes_physical_file(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    uploaded = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
    )

    evidence_id = UUID(uploaded["id"])

    evidence = db_session.get(Evidence, evidence_id)

    assert evidence is not None

    storage_path = Path(evidence.storage_key)

    assert storage_path.exists()

    response = client.delete(
        f"/cases/{evidence_case.id}/evidence/{evidence_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204
    assert not storage_path.exists()


def test_delete_evidence_cascades_processing_job(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    uploaded = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
    )

    evidence_id = UUID(uploaded["id"])

    statement = select(ProcessingJob).where(ProcessingJob.evidence_id == evidence_id)

    processing_job = db_session.scalar(statement)

    assert processing_job is not None

    response = client.delete(
        f"/cases/{evidence_case.id}/evidence/{evidence_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    db_session.expire_all()

    processing_job = db_session.scalar(statement)

    assert processing_job is None


def test_delete_evidence_not_found(
    client,
    auth_headers,
    evidence_case,
):
    response = client.delete(
        f"/cases/{evidence_case.id}/evidence/{uuid4()}",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Evidence not found"


def test_delete_running_evidence_returns_conflict(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    uploaded = upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
    )

    evidence_id = UUID(uploaded["id"])

    statement = select(ProcessingJob).where(ProcessingJob.evidence_id == evidence_id)

    processing_job = db_session.scalar(statement)

    assert processing_job is not None

    processing_job.status = "RUNNING"
    db_session.flush()

    response = client.delete(
        f"/cases/{evidence_case.id}/evidence/{evidence_id}",
        headers=auth_headers,
    )

    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "Evidence cannot be deleted while processing is running"
    )

    assert db_session.get(Evidence, evidence_id) is not None


def test_non_owner_cannot_delete_evidence(
    client,
    db_session,
    auth_headers,
    evidence_case,
):
    upload_test_evidence(
        client,
        auth_headers,
        evidence_case.id,
    )

    user = User(
        full_name="Evidence Case Member",
        email="evidence-member@example.com",
        password_hash="TEST_ONLY",
        system_role="USER",
        status="ACTIVE",
    )

    db_session.add(user)
    db_session.flush()

    # Add this user as a non-owner case member using your existing
    # CaseMember service/repository before making the DELETE request.
