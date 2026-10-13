from unittest.mock import Mock, sentinel
from uuid import uuid4

import pytest

from app.core.exceptions import (
    EvidenceFileIntegrityError,
    EvidenceFileNotFoundError,
    EvidenceFileSizeError,
    EvidenceFileTypeMismatchError,
    EvidenceNotFoundError,
    InvalidEvidenceStoragePathError,
    ProcessingJobNotFoundError,
    UnsupportedEvidenceFileTypeError,
)
from app.services.evidence_processing.file_validation_service import (
    EvidenceFileValidationService,
)
from app.services.evidence_processing.validators.file_integrity_validator import (
    FileIntegrityResult,
)


@pytest.fixture
def validation_setup():
    loader = Mock()
    integrity_validator = Mock()
    type_validator = Mock()

    loader.load.return_value = sentinel.descriptor

    integrity_validator.validate.return_value = FileIntegrityResult(
        file_size=100,
        checksum="a" * 64,
    )

    type_validator.validate.return_value = "pdf"

    service = EvidenceFileValidationService(
        file_loader=loader,
        integrity_validator=integrity_validator,
        type_validator=type_validator,
    )

    return service, loader, integrity_validator, type_validator


def test_successful_validation(validation_setup):
    service, loader, integrity, file_type = validation_setup
    job_id = uuid4()
    db = sentinel.db

    result = service.validate(db=db, job_id=job_id)

    loader.load.assert_called_once_with(
        db=db,
        job_id=job_id,
    )

    integrity.validate.assert_called_once_with(
        descriptor=sentinel.descriptor,
    )

    file_type.validate.assert_called_once_with(
        descriptor=sentinel.descriptor,
    )

    assert result.descriptor is sentinel.descriptor
    assert result.detected_file_type == "pdf"
    assert result.verified_size == 100
    assert result.verified_checksum == "a" * 64


def test_validation_order(validation_setup):
    service, loader, integrity, file_type = validation_setup

    tracker = Mock()
    tracker.attach_mock(loader.load, "load")
    tracker.attach_mock(integrity.validate, "integrity")
    tracker.attach_mock(file_type.validate, "file_type")

    service.validate(db=sentinel.db, job_id=uuid4())

    assert [call[0] for call in tracker.mock_calls] == [
        "load",
        "integrity",
        "file_type",
    ]


@pytest.mark.parametrize(
    "exception_class",
    [
        ProcessingJobNotFoundError,
        EvidenceNotFoundError,
        EvidenceFileNotFoundError,
        InvalidEvidenceStoragePathError,
    ],
)
def test_loader_failures_stop_validation(
    validation_setup,
    exception_class,
):
    service, loader, integrity, file_type = validation_setup
    loader.load.side_effect = exception_class("Loading failed")

    with pytest.raises(exception_class):
        service.validate(db=sentinel.db, job_id=uuid4())

    integrity.validate.assert_not_called()
    file_type.validate.assert_not_called()


@pytest.mark.parametrize(
    "exception_class",
    [
        EvidenceFileSizeError,
        EvidenceFileIntegrityError,
    ],
)
def test_integrity_failures_stop_type_validation(
    validation_setup,
    exception_class,
):
    service, loader, integrity, file_type = validation_setup
    integrity.validate.side_effect = exception_class("Integrity verification failed")

    with pytest.raises(exception_class):
        service.validate(db=sentinel.db, job_id=uuid4())

    loader.load.assert_called_once()
    file_type.validate.assert_not_called()


@pytest.mark.parametrize(
    "exception_class",
    [
        UnsupportedEvidenceFileTypeError,
        EvidenceFileTypeMismatchError,
    ],
)
def test_file_type_failures_propagate(
    validation_setup,
    exception_class,
):
    service, loader, integrity, file_type = validation_setup
    file_type.validate.side_effect = exception_class("File type validation failed")

    with pytest.raises(exception_class):
        service.validate(db=sentinel.db, job_id=uuid4())

    loader.load.assert_called_once()
    integrity.validate.assert_called_once()


def test_unexpected_errors_are_not_silenced(validation_setup):
    service, _, integrity, file_type = validation_setup

    integrity.validate.side_effect = RuntimeError("Unexpected validation failure")

    with pytest.raises(RuntimeError):
        service.validate(db=sentinel.db, job_id=uuid4())

    file_type.validate.assert_not_called()
