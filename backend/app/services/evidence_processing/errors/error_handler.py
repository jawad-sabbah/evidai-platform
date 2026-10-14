import logging

from app.services.evidence_processing.errors.error_classifier import (
    ExtractionErrorClassifier,
)
from app.services.evidence_processing.errors.extraction_failure import (
    ExtractionFailure,
)

logger = logging.getLogger(__name__)


class ExtractionErrorHandler:
    """Convert processing exceptions into safe failures and log diagnostics."""

    def __init__(
        self,
        classifier: ExtractionErrorClassifier | None = None,
        error_logger: logging.Logger | None = None,
    ) -> None:
        self._classifier = classifier or ExtractionErrorClassifier()
        self._logger = error_logger or logger

    def handle(self, error: Exception) -> ExtractionFailure:
        """Classify an exception and return a safe failure description."""

        classification = self._classifier.classify(error)

        self._logger.error(
            "Evidence extraction failed: code=%s exception_type=%s",
            classification.code.value,
            type(error).__name__,
        )

        return ExtractionFailure(
            code=classification.code,
            message=classification.message,
            retryable=classification.retryable,
            exception_type=type(error).__name__,
        )
