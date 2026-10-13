from hashlib import sha256
from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi import UploadFile

from app.core.exceptions import (
    EvidenceFileSizeError,
    EvidenceStorageConflictError,
)
from app.services.storage_service import LocalStorageService


@pytest.fixture
def storage_service(tmp_path):
    return LocalStorageService(
        base_dir=str(tmp_path / "evidence"),
        max_size_bytes=10,
    )


def make_upload(content: bytes, filename="evidence.txt"):
    return UploadFile(
        file=BytesIO(content),
        filename=filename,
    )


def test_save_valid_file(storage_service):
    content = b"1234567890"

    result = storage_service.save(
        file=make_upload(content),
        case_id=uuid4(),
        evidence_id=uuid4(),
    )

    assert result.file_size == len(content)
    assert result.checksum == sha256(content).hexdigest()
    assert Path(result.storage_key).read_bytes() == content


def test_reject_oversized_file(storage_service):
    case_id = uuid4()

    with pytest.raises(EvidenceFileSizeError):
        storage_service.save(
            file=make_upload(b"12345678901"),
            case_id=case_id,
            evidence_id=uuid4(),
        )

    case_dir = storage_service.base_dir / str(case_id)
    assert list(case_dir.iterdir()) == []


def test_reject_empty_file(storage_service):
    case_id = uuid4()

    with pytest.raises(EvidenceFileSizeError):
        storage_service.save(
            file=make_upload(b""),
            case_id=case_id,
            evidence_id=uuid4(),
        )

    case_dir = storage_service.base_dir / str(case_id)
    assert list(case_dir.iterdir()) == []


def test_preserve_existing_evidence(storage_service):
    case_id = uuid4()
    evidence_id = uuid4()

    original = storage_service.save(
        file=make_upload(b"Original"),
        case_id=case_id,
        evidence_id=evidence_id,
    )

    with pytest.raises(EvidenceStorageConflictError):
        storage_service.save(
            file=make_upload(b"Modified"),
            case_id=case_id,
            evidence_id=evidence_id,
        )

    assert Path(original.storage_key).read_bytes() == b"Original"

    case_dir = storage_service.base_dir / str(case_id)
    assert len(list(case_dir.iterdir())) == 1


def test_failed_upload_does_not_modify_original(storage_service):
    case_id = uuid4()
    evidence_id = uuid4()

    original = storage_service.save(
        file=make_upload(b"Original"),
        case_id=case_id,
        evidence_id=evidence_id,
    )

    with pytest.raises(EvidenceFileSizeError):
        storage_service.save(
            file=make_upload(b"Too large to store"),
            case_id=case_id,
            evidence_id=evidence_id,
        )

    assert Path(original.storage_key).read_bytes() == b"Original"


def test_checksum_matches_saved_content(storage_service):
    content = b"Evidence"

    result = storage_service.save(
        file=make_upload(content),
        case_id=uuid4(),
        evidence_id=uuid4(),
    )

    stored_content = Path(result.storage_key).read_bytes()

    assert result.checksum == sha256(stored_content).hexdigest()


def test_sanitizes_windows_filename(storage_service):
    result = storage_service.save(
        file=make_upload(
            b"Evidence",
            filename=r"C:\Users\person\Desktop\report.TXT",
        ),
        case_id=uuid4(),
        evidence_id=uuid4(),
    )

    assert Path(result.storage_key).suffix == ".txt"
    assert Path(result.storage_key).read_bytes() == b"Evidence"


def test_invalid_size_configuration(tmp_path):
    with pytest.raises(ValueError):
        LocalStorageService(
            base_dir=str(tmp_path),
            max_size_bytes=0,
        )


def test_no_temporary_files_after_success(storage_service):
    case_id = uuid4()

    storage_service.save(
        file=make_upload(b"Evidence"),
        case_id=case_id,
        evidence_id=uuid4(),
    )

    case_dir = storage_service.base_dir / str(case_id)

    assert all(not path.name.endswith(".tmp") for path in case_dir.iterdir())
