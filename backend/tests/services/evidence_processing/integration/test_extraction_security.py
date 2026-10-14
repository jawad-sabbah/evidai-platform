import logging

import pytest

from app.core.exceptions import (
    EvidenceFileIntegrityError,
    TextExtractionError,
    UnsupportedEvidenceExtractorError,
)
from app.services.evidence_processing.errors.error_code import (
    ExtractionErrorCode,
)
from app.services.evidence_processing.errors.error_handler import (
    ExtractionErrorHandler,
)


def test_tampered_evidence_is_rejected_before_extraction(
    evidence_builder,
    validated_snapshot,
):
    descriptor = evidence_builder(
        "notes.txt",
        b"Original evidence",
    )

    descriptor.path.write_bytes(b"Modified evidence")

    with (
        pytest.raises(EvidenceFileIntegrityError),
        validated_snapshot(descriptor),
    ):
        pass


def test_snapshot_cleanup_after_success(
    evidence_builder,
    validated_snapshot,
    extractor_factory,
):
    descriptor = evidence_builder(
        "notes.txt",
        b"Important statement",
    )

    with validated_snapshot(descriptor) as evidence_file:
        snapshot_path = evidence_file.descriptor.path

        assert snapshot_path.exists()
        assert snapshot_path != descriptor.path

        extractor = extractor_factory.get_extractor("txt")
        result = extractor.extract(evidence_file)

        assert result.blocks[0].text == "Important statement"

    assert not snapshot_path.exists()
    assert descriptor.path.exists()


def test_snapshot_cleanup_after_extraction_error(
    evidence_builder,
    validated_snapshot,
    extractor_factory,
):
    content = b'{"invalid":}'
    descriptor = evidence_builder(
        "invalid.json",
        content,
    )

    with (
        pytest.raises(TextExtractionError),
        validated_snapshot(descriptor) as evidence_file,
    ):
        snapshot_path = evidence_file.descriptor.path

        extractor = extractor_factory.get_extractor("json")
        extractor.extract(evidence_file)

    assert not snapshot_path.exists()
    assert descriptor.path.read_bytes() == content


def test_unsupported_format_is_classified_safely(
    extractor_factory,
):
    try:
        extractor_factory.get_extractor("unknown")
    except UnsupportedEvidenceExtractorError as error:
        failure = ExtractionErrorHandler().handle(error)
    else:
        pytest.fail("Unsupported format should have been rejected")

    assert failure.code == ExtractionErrorCode.UNSUPPORTED_FORMAT
    assert failure.retryable is False


def test_parser_failure_does_not_expose_file_content(
    evidence_builder,
    validated_snapshot,
    extractor_factory,
    caplog,
):
    sensitive_content = b'{"SECRET_EVIDENCE_VALUE": }'

    descriptor = evidence_builder(
        "invalid.json",
        sensitive_content,
    )

    with validated_snapshot(descriptor) as evidence_file:
        extractor = extractor_factory.get_extractor("json")

        with pytest.raises(TextExtractionError) as error_info:
            extractor.extract(evidence_file)

    with caplog.at_level(logging.ERROR):
        failure = ExtractionErrorHandler().handle(error_info.value)

    assert failure.code == ExtractionErrorCode.EXTRACTION_FAILED
    assert sensitive_content.decode() not in failure.message
    assert sensitive_content.decode() not in caplog.text
