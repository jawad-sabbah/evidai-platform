import pytest

from app.core.exceptions import (
    AudioExtractionError,
    AudioExtractionLimitError,
    DocxExtractionError,
    DocxExtractionLimitError,
    EncryptedEvidencePdfError,
    EvidenceOcrError,
    EvidenceOcrLimitError,
    ExtractionMetadataError,
    MalformedEvidenceFileError,
    MessageExtractionError,
    MessageExtractionLimitError,
    PdfExtractionError,
    PdfExtractionLimitError,
    SpreadsheetExtractionError,
    SpreadsheetExtractionLimitError,
    TextExtractionError,
    TextExtractionLimitError,
    UnsupportedEvidenceExtractorError,
)
from app.services.evidence_processing.errors.error_classifier import (
    ExtractionErrorClassifier,
)
from app.services.evidence_processing.errors.error_code import (
    ExtractionErrorCode,
)


@pytest.mark.parametrize(
    ("error", "expected_code"),
    [
        (
            UnsupportedEvidenceExtractorError("Unsupported"),
            ExtractionErrorCode.UNSUPPORTED_FORMAT,
        ),
        (
            EncryptedEvidencePdfError("Encrypted"),
            ExtractionErrorCode.ENCRYPTED_FILE,
        ),
        (
            MalformedEvidenceFileError("Malformed"),
            ExtractionErrorCode.INVALID_FILE,
        ),
        (
            PdfExtractionLimitError("Limit"),
            ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
        ),
        (
            DocxExtractionLimitError("Limit"),
            ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
        ),
        (
            TextExtractionLimitError("Limit"),
            ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
        ),
        (
            SpreadsheetExtractionLimitError("Limit"),
            ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
        ),
        (
            EvidenceOcrLimitError("Limit"),
            ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
        ),
        (
            MessageExtractionLimitError("Limit"),
            ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
        ),
        (
            AudioExtractionLimitError("Limit"),
            ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
        ),
        (
            ExtractionMetadataError("Invalid metadata"),
            ExtractionErrorCode.METADATA_INVALID,
        ),
        (
            EvidenceOcrError("OCR failed"),
            ExtractionErrorCode.OCR_FAILED,
        ),
        (
            AudioExtractionError("Transcription failed"),
            ExtractionErrorCode.TRANSCRIPTION_FAILED,
        ),
        (
            PdfExtractionError("PDF failed"),
            ExtractionErrorCode.EXTRACTION_FAILED,
        ),
        (
            DocxExtractionError("DOCX failed"),
            ExtractionErrorCode.EXTRACTION_FAILED,
        ),
        (
            TextExtractionError("Text failed"),
            ExtractionErrorCode.EXTRACTION_FAILED,
        ),
        (
            SpreadsheetExtractionError("XLSX failed"),
            ExtractionErrorCode.EXTRACTION_FAILED,
        ),
        (
            MessageExtractionError("EML failed"),
            ExtractionErrorCode.EXTRACTION_FAILED,
        ),
        (
            TimeoutError("Timed out"),
            ExtractionErrorCode.INTERNAL_ERROR,
        ),
        (
            RuntimeError("Unknown error"),
            ExtractionErrorCode.INTERNAL_ERROR,
        ),
    ],
)
def test_classify_extraction_errors(error, expected_code):
    classification = ExtractionErrorClassifier().classify(error)

    assert classification.code == expected_code


def test_timeout_is_retryable():
    classification = ExtractionErrorClassifier().classify(TimeoutError("Timed out"))

    assert classification.retryable is True


def test_corrupted_document_is_not_retryable():
    classification = ExtractionErrorClassifier().classify(
        MalformedEvidenceFileError("Invalid document")
    )

    assert classification.retryable is False


def test_limit_errors_take_priority_over_parent_errors():
    classification = ExtractionErrorClassifier().classify(
        AudioExtractionLimitError("Duration exceeded")
    )

    assert classification.code == (ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED)
