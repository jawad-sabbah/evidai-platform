import hashlib
from dataclasses import replace
from uuid import uuid4

import pytest

from app.core.exceptions import (
    EvidenceFileIntegrityError,
    EvidenceFileNotFoundError,
    EvidenceFileSizeError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.validators.file_integrity_validator import (
    EvidenceFileIntegrityValidator,
)


@pytest.fixture
def evidence_descriptor(tmp_path):
    content = b"Original investigation evidence"
    path = tmp_path / "evidence.txt"
    path.write_bytes(content)

    return EvidenceFileDescriptor(
        evidence_id=uuid4(),
        case_id=uuid4(),
        path=path,
        original_filename="evidence.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=len(content),
        checksum=hashlib.sha256(content).hexdigest(),
    )


@pytest.fixture
def validator():
    return EvidenceFileIntegrityValidator(max_size_bytes=1024)


def test_valid_evidence(evidence_descriptor, validator):
    result = validator.validate(evidence_descriptor)

    assert result.file_size == evidence_descriptor.file_size
    assert result.checksum == evidence_descriptor.checksum


def test_original_file_is_unchanged(evidence_descriptor, validator):
    before = evidence_descriptor.path.read_bytes()

    validator.validate(evidence_descriptor)

    assert evidence_descriptor.path.read_bytes() == before


def test_reject_oversized_file(evidence_descriptor):
    validator = EvidenceFileIntegrityValidator(max_size_bytes=10)

    with pytest.raises(EvidenceFileSizeError):
        validator.validate(evidence_descriptor)


def test_reject_empty_file(evidence_descriptor, validator):
    evidence_descriptor.path.write_bytes(b"")
    descriptor = replace(
        evidence_descriptor,
        file_size=0,
        checksum=hashlib.sha256(b"").hexdigest(),
    )

    with pytest.raises(EvidenceFileSizeError):
        validator.validate(descriptor)


def test_reject_modified_file(evidence_descriptor, validator):
    evidence_descriptor.path.write_bytes(b"Modified investigation evidence")

    with pytest.raises(EvidenceFileIntegrityError):
        validator.validate(evidence_descriptor)


def test_reject_file_size_mismatch(evidence_descriptor, validator):
    descriptor = replace(
        evidence_descriptor,
        file_size=evidence_descriptor.file_size + 1,
    )

    with pytest.raises(EvidenceFileIntegrityError):
        validator.validate(descriptor)


def test_reject_missing_checksum(evidence_descriptor, validator):
    descriptor = replace(evidence_descriptor, checksum=None)

    with pytest.raises(EvidenceFileIntegrityError):
        validator.validate(descriptor)


def test_reject_invalid_checksum(evidence_descriptor, validator):
    descriptor = replace(
        evidence_descriptor,
        checksum="not-a-sha256-hash",
    )

    with pytest.raises(EvidenceFileIntegrityError):
        validator.validate(descriptor)


def test_reject_missing_file(evidence_descriptor, validator):
    evidence_descriptor.path.unlink()

    with pytest.raises(EvidenceFileNotFoundError):
        validator.validate(evidence_descriptor)


def test_reject_invalid_configuration():
    with pytest.raises(ValueError):
        EvidenceFileIntegrityValidator(max_size_bytes=0)


def test_reject_negative_stored_file_size(evidence_descriptor, validator):
    descriptor = replace(evidence_descriptor, file_size=-1)

    with pytest.raises(EvidenceFileIntegrityError):
        validator.validate(descriptor)


def test_accept_uppercase_checksum(evidence_descriptor, validator):
    descriptor = replace(
        evidence_descriptor,
        checksum=evidence_descriptor.checksum.upper(),
    )

    result = validator.validate(descriptor)

    assert result.checksum == evidence_descriptor.checksum
