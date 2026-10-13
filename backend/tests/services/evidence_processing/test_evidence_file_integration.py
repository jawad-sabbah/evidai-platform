import hashlib
import json
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.core.exceptions import (
    EvidenceFileIntegrityError,
    EvidenceFileNotFoundError,
    EvidenceFileSizeError,
    EvidenceFileTypeMismatchError,
    InvalidEvidenceStoragePathError,
    MalformedEvidenceFileError,
    UnsupportedEvidenceFileTypeError,
)
from app.services.evidence_processing import file_loader as loader_module
from app.services.evidence_processing.file_loader import EvidenceFileLoader
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
def validation_environment(tmp_path, monkeypatch):
    """Create real temporary files with mocked database repositories."""

    job_id = uuid4()
    case_id = uuid4()
    evidence_id = uuid4()

    storage_service = LocalStorageService(
        base_dir=str(tmp_path / "storage" / "evidence")
    )

    case_directory = storage_service.base_dir / str(case_id)
    case_directory.mkdir(parents=True)

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
        file_size=0,
        checksum="",
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

    loader = EvidenceFileLoader(storage_service=storage_service)

    integrity_validator = EvidenceFileIntegrityValidator(max_size_bytes=1024 * 1024)

    type_validator = EvidenceFileTypeValidator()

    service = EvidenceFileValidationService(
        file_loader=loader,
        integrity_validator=integrity_validator,
        type_validator=type_validator,
    )

    def create_evidence(
        filename: str,
        content: bytes,
        declared_type: str | None = None,
    ) -> Path:
        path = case_directory / filename
        path.write_bytes(content)

        evidence.storage_key = str(path)
        evidence.original_filename = filename
        evidence.file_type = declared_type or path.suffix.lstrip(".")
        evidence.file_size = len(content)
        evidence.checksum = hashlib.sha256(content).hexdigest()

        return path

    return SimpleNamespace(
        service=service,
        job_id=job_id,
        evidence=evidence,
        create_evidence=create_evidence,
        case_directory=case_directory,
    )


@pytest.mark.parametrize(
    ("filename", "content"),
    [
        ("notes.txt", b"Investigation notes"),
        ("records.csv", b"name,age\nAlice,30\n"),
        (
            "metadata.json",
            json.dumps({"case": "EV-194"}).encode(),
        ),
        ("evidence.xml", b"<evidence><id>1</id></evidence>"),
    ],
)
def test_supported_file_validation(
    validation_environment,
    filename,
    content,
):
    """Supported sample files pass the complete validation workflow."""

    env = validation_environment
    env.create_evidence(filename, content)

    result = env.service.validate(
        db=None,
        job_id=env.job_id,
    )

    assert result.detected_file_type == Path(filename).suffix.lstrip(".")
    assert result.verified_size == len(content)
    assert result.verified_checksum == hashlib.sha256(content).hexdigest()


def test_original_file_preserved(validation_environment):
    """Validation must not modify the original evidence."""

    env = validation_environment
    original = b"Important original evidence"
    path = env.create_evidence("original.txt", original)

    before = path.read_bytes()

    env.service.validate(db=None, job_id=env.job_id)

    assert path.read_bytes() == before


def test_modified_file_rejected(validation_environment):
    """Modified content must fail checksum verification."""

    env = validation_environment
    path = env.create_evidence("notes.txt", b"Original evidence")

    path.write_bytes(b"Modified evidence")

    with pytest.raises(EvidenceFileIntegrityError):
        env.service.validate(db=None, job_id=env.job_id)


def test_oversized_file_rejected(validation_environment):
    """Files larger than the configured limit must be rejected."""

    env = validation_environment
    env.create_evidence("large.txt", b"A" * (1024 * 1024 + 1))

    with pytest.raises(EvidenceFileSizeError):
        env.service.validate(db=None, job_id=env.job_id)


def test_empty_file_rejected(validation_environment):
    """Empty evidence files must not proceed to extraction."""

    env = validation_environment
    env.create_evidence("empty.txt", b"")

    with pytest.raises(EvidenceFileSizeError):
        env.service.validate(db=None, job_id=env.job_id)


def test_unsupported_file_rejected(validation_environment):
    """Unsupported extensions must be rejected."""

    env = validation_environment
    env.create_evidence("program.exe", b"MZ")

    with pytest.raises(UnsupportedEvidenceFileTypeError):
        env.service.validate(db=None, job_id=env.job_id)


def test_file_type_mismatch_rejected(validation_environment):
    """Declared type must match the filename and its content."""

    env = validation_environment
    env.create_evidence(
        "notes.txt",
        b"Plain text",
        declared_type="pdf",
    )

    with pytest.raises(EvidenceFileTypeMismatchError):
        env.service.validate(db=None, job_id=env.job_id)


def test_corrupted_json_rejected(validation_environment):
    """Malformed JSON documents must be rejected."""

    env = validation_environment
    env.create_evidence("broken.json", b'{"invalid":}')

    with pytest.raises(MalformedEvidenceFileError):
        env.service.validate(db=None, job_id=env.job_id)


def test_missing_original_file_rejected(validation_environment):
    """Deleted source evidence must not be processed."""

    env = validation_environment
    path = env.create_evidence("missing.txt", b"Evidence")
    path.unlink()

    with pytest.raises(EvidenceFileNotFoundError):
        env.service.validate(db=None, job_id=env.job_id)


def test_external_storage_path_rejected(
    validation_environment,
    tmp_path,
):
    """Files outside the permitted case directory must be rejected."""

    env = validation_environment

    external_file = tmp_path / "external.txt"
    external_file.write_bytes(b"External content")

    env.create_evidence("notes.txt", b"Original content")
    env.evidence.storage_key = str(external_file)

    with pytest.raises(InvalidEvidenceStoragePathError):
        env.service.validate(db=None, job_id=env.job_id)


def test_checksum_metadata_mismatch(validation_environment):
    """An incorrect stored checksum must stop processing."""

    env = validation_environment
    env.create_evidence("notes.txt", b"Original evidence")

    env.evidence.checksum = "0" * 64

    with pytest.raises(EvidenceFileIntegrityError):
        env.service.validate(db=None, job_id=env.job_id)


def test_file_size_metadata_mismatch(validation_environment):
    """Incorrect stored file size must be detected."""

    env = validation_environment
    env.create_evidence("notes.txt", b"Original evidence")

    env.evidence.file_size += 10

    with pytest.raises(EvidenceFileIntegrityError):
        env.service.validate(db=None, job_id=env.job_id)
