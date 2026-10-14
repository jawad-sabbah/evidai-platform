from dataclasses import dataclass

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
from app.services.evidence_processing.errors.error_code import (
    ExtractionErrorCode,
)


@dataclass(frozen=True, slots=True)
class ErrorClassification:
    """Internal classification and retry recommendation."""

    code: ExtractionErrorCode
    message: str
    retryable: bool = False


class ExtractionErrorClassifier:
    """Classify exceptions without changing their original types."""

    _RULES: tuple[
        tuple[type[Exception], ErrorClassification],
        ...,
    ] = (
        (
            UnsupportedEvidenceExtractorError,
            ErrorClassification(
                ExtractionErrorCode.UNSUPPORTED_FORMAT,
                "This evidence format is not supported for extraction.",
            ),
        ),
        (
            EncryptedEvidencePdfError,
            ErrorClassification(
                ExtractionErrorCode.ENCRYPTED_FILE,
                "The document is encrypted and cannot be extracted.",
            ),
        ),
        (
            (
                PdfExtractionLimitError,
                DocxExtractionLimitError,
                TextExtractionLimitError,
                SpreadsheetExtractionLimitError,
                EvidenceOcrLimitError,
                MessageExtractionLimitError,
                AudioExtractionLimitError,
            ),
            ErrorClassification(
                ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED,
                "Evidence extraction exceeded a configured limit.",
            ),
        ),
        (
            ExtractionMetadataError,
            ErrorClassification(
                ExtractionErrorCode.METADATA_INVALID,
                "Evidence extraction metadata is inconsistent.",
            ),
        ),
        (
            MalformedEvidenceFileError,
            ErrorClassification(
                ExtractionErrorCode.INVALID_FILE,
                "The evidence file is malformed or invalid.",
            ),
        ),
        (
            EvidenceOcrError,
            ErrorClassification(
                ExtractionErrorCode.OCR_FAILED,
                "Optical character recognition failed.",
            ),
        ),
        (
            AudioExtractionError,
            ErrorClassification(
                ExtractionErrorCode.TRANSCRIPTION_FAILED,
                "Audio transcription or decoding failed.",
            ),
        ),
        (
            (
                PdfExtractionError,
                DocxExtractionError,
                TextExtractionError,
                SpreadsheetExtractionError,
                MessageExtractionError,
            ),
            ErrorClassification(
                ExtractionErrorCode.EXTRACTION_FAILED,
                "Unable to extract content from this evidence file.",
            ),
        ),
        (
            TimeoutError,
            ErrorClassification(
                ExtractionErrorCode.INTERNAL_ERROR,
                "Evidence processing timed out.",
                retryable=True,
            ),
        ),
    )

    def classify(self, error: Exception) -> ErrorClassification:
        """Return a safe classification for a processing exception."""

        for exception_types, classification in self._RULES:
            if isinstance(error, exception_types):
                return classification

        return ErrorClassification(
            code=ExtractionErrorCode.INTERNAL_ERROR,
            message="An unexpected evidence processing error occurred.",
        )
