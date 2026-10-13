import hashlib
from contextlib import contextmanager
from io import BytesIO
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import UploadFile

from app.core.exceptions import (
    EvidenceFileIntegrityError,
    EvidenceFileSizeError,
    MalformedEvidenceFileError,
)
from app.services.evidence_processing import file_loader as loader_module
from app.services.evidence_processing.file_loader import EvidenceFileLoader
from app.services.evidence_processing.file_snapshot_service import (
    EvidenceFileSnapshotService,
)
from app.services.evidence_processing.file_validation_service import (
    EvidenceFileValidationService,
)
from app.services.evidence_processing.validators.file_integrity_validator import (
    EvidenceFileIntegrityValidator,
)
from app.services.evidence_processing.validators.file_type_validator import (
    EvidenceFileTypeValidator,
)
from app.services.storage_service import LocalStorageService


@pytest.fixture
def security_environment(tmp_path, monkeypatch):
    """Create real storage and validation services with mocked repositories."""

    case_id = uuid4()
    evidence_id = uuid4()
    job_id = uuid4()

    storage = LocalStorageService(
        base_dir=str(tmp_path / "storage" / "evidence"),
        max_size_bytes=1024,
    )

    job = SimpleNamespace(
        id=job_id,
        case_id=case_id,
        evidence_id=evidence_id,
    )

    evidence = SimpleNamespace(
        id=evidence_id,
        case_id=case_id,
        storage_key="",
        original_filename="",
        file_type="",
        mime_type="text/plain",
        file_size=None,
        checksum=None,
    )

    def get_job(db, job_id):
        return job

    def get_evidence(db, evidence_id, case_id):
        if evidence_id == evidence.id and case_id == evidence.case_id:
            return evidence

        return None

    monkeypatch.setattr(
        loader_module.processing_job_repository,
        "get_fresh_by_id",
        get_job,
    )

    monkeypatch.setattr(
        loader_module.evidence_repository,
        "get_by_id_and_case_id",
        get_evidence,
    )

    snapshot_service = EvidenceFileSnapshotService(max_size_bytes=1024)

    validation_service = EvidenceFileValidationService(
        file_loader=EvidenceFileLoader(storage),
        integrity_validator=EvidenceFileIntegrityValidator(max_size_bytes=1024),
        type_validator=EvidenceFileTypeValidator(),
        snapshot_service=snapshot_service,
    )

    def upload(filename, content):
        uploaded_file = UploadFile(
            file=BytesIO(content),
            filename=filename,
        )

        result = storage.save(
            file=uploaded_file,
            case_id=case_id,
            evidence_id=evidence_id,
        )

        evidence.storage_key = result.storage_key
        evidence.original_filename = filename
        evidence.file_type = Path(filename).suffix.lstrip(".")
        evidence.file_size = result.file_size
        evidence.checksum = result.checksum

        return Path(result.storage_key)

    return SimpleNamespace(
        storage=storage,
        evidence=evidence,
        job_id=job_id,
        validation_service=validation_service,
        snapshot_service=snapshot_service,
        upload=upload,
    )


def test_complete_secure_validation(security_environment):
    """Real storage, snapshot, integrity and type checks work together."""

    env = security_environment
    original_content = b"Important investigation evidence"

    original_path = env.upload(
        "investigation.txt",
        original_content,
    )

    with env.validation_service.open_validated(
        db=None,
        job_id=env.job_id,
    ) as validated:
        snapshot_path = validated.descriptor.path

        assert snapshot_path != original_path.resolve()
        assert snapshot_path.exists()
        assert snapshot_path.read_bytes() == original_content
        assert validated.detected_file_type == "txt"
        assert validated.verified_size == len(original_content)
        assert (
            validated.verified_checksum == hashlib.sha256(original_content).hexdigest()
        )

    assert not snapshot_path.exists()
    assert original_path.read_bytes() == original_content


def test_snapshot_isolated_from_original_modification(
    security_environment,
):
    """Changing the source after snapshot creation does not change it."""

    env = security_environment
    content = b"Original evidence bytes"

    original_path = env.upload("evidence.txt", content)

    with env.validation_service.open_validated(
        db=None,
        job_id=env.job_id,
    ) as validated:
        snapshot_path = validated.descriptor.path

        original_path.write_bytes(b"Modified original")

        assert snapshot_path.read_bytes() == content
        assert snapshot_path.read_bytes() != original_path.read_bytes()

    assert not snapshot_path.exists()


def test_tampered_evidence_is_rejected(security_environment):
    """Evidence modified before snapshot creation fails verification."""

    env = security_environment
    original_path = env.upload(
        "evidence.txt",
        b"Original evidence",
    )

    original_path.write_bytes(b"Tampered evidence")

    with (
        pytest.raises(EvidenceFileIntegrityError),
        env.validation_service.open_validated(
            db=None,
            job_id=env.job_id,
        ),
    ):
        pass


def test_corrupted_json_rejected(security_environment):
    """Invalid JSON cannot pass the snapshot validation workflow."""

    env = security_environment
    original_content = b'{"invalid":}'

    original_path = env.upload(
        "broken.json",
        original_content,
    )

    with (
        pytest.raises(MalformedEvidenceFileError),
        env.validation_service.open_validated(
            db=None,
            job_id=env.job_id,
        ),
    ):
        pass

    assert original_path.read_bytes() == original_content


def test_oversized_upload_rejected(security_environment):
    """An oversized upload never produces a completed evidence file."""

    env = security_environment

    with pytest.raises(EvidenceFileSizeError):
        env.upload(
            "large.txt",
            b"A" * 1025,
        )

    case_directory = env.storage.base_dir / str(env.evidence.case_id)

    assert list(case_directory.iterdir()) == []


def test_snapshot_cleanup_after_validation_failure(
    security_environment,
    monkeypatch,
):
    """Temporary snapshots are removed even when format validation fails."""

    env = security_environment
    original_path = env.upload(
        "broken.json",
        b'{"invalid":}',
    )

    created_snapshots = []
    original_open_snapshot = env.snapshot_service.open_snapshot

    @contextmanager
    def tracking_snapshot(descriptor):
        with original_open_snapshot(descriptor) as snapshot:
            created_snapshots.append(snapshot.path)
            yield snapshot

    monkeypatch.setattr(
        env.snapshot_service,
        "open_snapshot",
        tracking_snapshot,
    )

    with (
        pytest.raises(MalformedEvidenceFileError),
        env.validation_service.open_validated(
            db=None,
            job_id=env.job_id,
        ),
    ):
        pass

    assert len(created_snapshots) == 1
    assert not created_snapshots[0].exists()
    assert original_path.exists()


def test_snapshot_metadata_preserved(security_environment):
    """Snapshot validation preserves evidence identity and provenance."""

    env = security_environment
    env.upload("notes.txt", b"Case investigation notes")

    with env.validation_service.open_validated(
        db=None,
        job_id=env.job_id,
    ) as validated:
        descriptor = validated.descriptor

        assert descriptor.evidence_id == env.evidence.id
        assert descriptor.case_id == env.evidence.case_id
        assert descriptor.original_filename == "notes.txt"
        assert descriptor.file_type == "txt"
        assert descriptor.checksum == env.evidence.checksum
