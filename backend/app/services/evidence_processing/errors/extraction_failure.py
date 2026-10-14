from dataclasses import dataclass

from app.services.evidence_processing.errors.error_code import (
    ExtractionErrorCode,
)


@dataclass(frozen=True, slots=True)
class ExtractionFailure:
    """Safe, structured description of an extraction failure."""

    code: ExtractionErrorCode
    message: str
    retryable: bool
    exception_type: str
