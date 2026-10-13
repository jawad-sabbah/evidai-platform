
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.core.exceptions import (
    EvidenceFileNotFoundError,
    EvidenceNotFoundError,
    InvalidEvidenceStoragePathError,
    ProcessingJobNotFoundError,
)
from app.services.evidence_processing import file_loader as loader_module
from app.services.evidence_processing.file_loader import EvidenceFileLoader
from app.services.storage_service import LocalStorageService


@pytest.fixture
def evidence_setup(tmp_path, monkeypatch):
    """Create a temporary evidence file and mock repository lookups."""

    job_id = uuid4()
    evidence_id = uuid4()
    case_id = uuid4()

    storage_service = LocalStorageService(
        base_dir=str(tmp_path / "storage" / "evidence")
    )

    case_directory = storage_service.base_dir / str(case_id)
    case_directory.mkdir(parents=True)

    file_path = case_directory / f"{evidence_id}.txt"
    file_content = b"Example investigation evidence"
    file_path.write_bytes(file_content)

    job = SimpleNamespace(
        id=job_id,
        evidence_id=evidence_id,
        case_id=case_id,
    )

    evidence = SimpleNamespace(
        id=evidence_id,
        case_id=case_id,
        storage_key=str(file_path),
        original_filename="investigation.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=len(file_content),
        checksum="example-checksum",
    )

    def get_job(db, job_id):
        return job

    def get_evidence(db, evidence_id, case_id):
        return evidence

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

    return SimpleNamespace(
        job_id=job_id,
        job=job,
        evidence=evidence,
        file_path=file_path,
        file_content=file_content,
        loader=loader,
    )


def test_load_valid_evidence(evidence_setup):
    """Loader returns the correct descriptor for valid evidence."""

    descriptor = evidence_setup.loader.load(
        db=None,
        job_id=evidence_setup.job_id,
    )

    assert descriptor.evidence_id == evidence_setup.evidence.id
    assert descriptor.case_id == evidence_setup.evidence.case_id
    assert descriptor.path == evidence_setup.file_path.resolve()
    assert descriptor.original_filename == "investigation.txt"
    assert descriptor.file_type == "txt"
    assert descriptor.file_size == len(evidence_setup.file_content)


def test_descriptor_opens_original_file(evidence_setup):
    """Descriptor provides read-only access to the original file."""

    descriptor = evidence_setup.loader.load(
        db=None,
        job_id=evidence_setup.job_id,
    )

    with descriptor.open() as file:
        assert file.mode == "rb"
        content = file.read()

    assert content == evidence_setup.file_content
    assert evidence_setup.file_path.read_bytes() == content


def test_missing_processing_job(evidence_setup, monkeypatch):
    """Missing processing jobs raise ProcessingJobNotFoundError."""

    monkeypatch.setattr(
        loader_module.processing_job_repository,
        "get_fresh_by_id",
        lambda db, job_id: None,
    )

    with pytest.raises(ProcessingJobNotFoundError):
        evidence_setup.loader.load(
            db=None,
            job_id=evidence_setup.job_id,
        )


def test_missing_evidence_record(evidence_setup, monkeypatch):
    """Missing evidence database records raise EvidenceNotFoundError."""

    monkeypatch.setattr(
        loader_module.evidence_repository,
        "get_by_id_and_case_id",
        lambda db, evidence_id, case_id: None,
    )

    with pytest.raises(EvidenceNotFoundError):
        evidence_setup.loader.load(
            db=None,
            job_id=evidence_setup.job_id,
        )


def test_missing_original_file(evidence_setup):
    """Missing physical evidence files raise EvidenceFileNotFoundError."""

    evidence_setup.file_path.unlink()

    with pytest.raises(EvidenceFileNotFoundError):
        evidence_setup.loader.load(
            db=None,
            job_id=evidence_setup.job_id,
        )


def test_reject_storage_path_outside_case(evidence_setup, tmp_path):
    """Loader rejects files located outside the evidence case directory."""

    other_file = tmp_path / "outside.txt"
    other_file.write_bytes(b"Outside evidence")

    evidence_setup.evidence.storage_key = str(other_file)

    with pytest.raises(InvalidEvidenceStoragePathError):
        evidence_setup.loader.load(
            db=None,
            job_id=evidence_setup.job_id,
        )


def test_reject_missing_path_outside_case(evidence_setup, tmp_path):
    """Even nonexistent paths outside the case directory are rejected."""

    outside_path = tmp_path / "missing-outside.txt"
    evidence_setup.evidence.storage_key = str(outside_path)

    with pytest.raises(InvalidEvidenceStoragePathError):
        evidence_setup.loader.load(
            db=None,
            job_id=evidence_setup.job_id,
        )


def test_reject_directory_instead_of_file(evidence_setup):
    """A directory cannot be loaded as an evidence file."""

    evidence_setup.evidence.storage_key = str(
        evidence_setup.file_path.parent
    )

    with pytest.raises(EvidenceFileNotFoundError):
        evidence_setup.loader.load(
            db=None,
            job_id=evidence_setup.job_id,
        )


def test_preserve_evidence_metadata(evidence_setup):
    """Metadata from the database is preserved in the descriptor."""

    descriptor = evidence_setup.loader.load(
        db=None,
        job_id=evidence_setup.job_id,
    )

    assert descriptor.mime_type == "text/plain"
    assert descriptor.checksum == "example-checksum"
    assert descriptor.original_filename == "investigation.txt"
    assert isinstance(descriptor.path, Path)


def test_loader_does_not_modify_original_file(evidence_setup):
    """Loading evidence must not change its original bytes."""

    original_bytes = evidence_setup.file_path.read_bytes()

    evidence_setup.loader.load(
        db=None,
        job_id=evidence_setup.job_id,
    )

    assert evidence_setup.file_path.read_bytes() == original_bytes


def test_reject_evidence_from_different_case(
    evidence_setup,
    monkeypatch,
):
    """The evidence lookup must remain scoped to the processing job's case."""

    different_case_id = uuid4()
    original_lookup = (
        loader_module.evidence_repository.get_by_id_and_case_id
    )

    def get_evidence(db, evidence_id, case_id):
        assert case_id == evidence_setup.job.case_id
        assert evidence_id == evidence_setup.job.evidence_id
        return None

    monkeypatch.setattr(
        loader_module.evidence_repository,
        "get_by_id_and_case_id",
        get_evidence,
    )

    evidence_setup.evidence.case_id = different_case_id

    with pytest.raises(EvidenceNotFoundError):
        evidence_setup.loader.load(
            db=None,
            job_id=evidence_setup.job_id,
        )
