import logging

from app.core.exceptions import (
    EncryptedEvidencePdfError,
    PdfExtractionLimitError,
)
from app.services.evidence_processing.errors.error_code import (
    ExtractionErrorCode,
)
from app.services.evidence_processing.errors.error_handler import (
    ExtractionErrorHandler,
)


def test_handler_returns_structured_failure():
    handler = ExtractionErrorHandler()

    failure = handler.handle(EncryptedEvidencePdfError("Sensitive internal details"))

    assert failure.code == ExtractionErrorCode.ENCRYPTED_FILE
    assert failure.retryable is False
    assert failure.exception_type == "EncryptedEvidencePdfError"
    assert "Sensitive internal details" not in failure.message


def test_handler_preserves_error_category():
    failure = ExtractionErrorHandler().handle(PdfExtractionLimitError("Too many pages"))

    assert failure.code == (ExtractionErrorCode.RESOURCE_LIMIT_EXCEEDED)


def test_handler_does_not_log_sensitive_error_messages(caplog):
    sensitive_text = "CONFIDENTIAL EVIDENCE CONTENT"

    with caplog.at_level(logging.ERROR):
        ExtractionErrorHandler().handle(RuntimeError(sensitive_text))

    assert sensitive_text not in caplog.text
    assert "INTERNAL_ERROR" in caplog.text
    assert "RuntimeError" in caplog.text


def test_handler_logs_classification(caplog):
    with caplog.at_level(logging.ERROR):
        ExtractionErrorHandler().handle(EncryptedEvidencePdfError("Password required"))

    assert "ENCRYPTED_FILE" in caplog.text
    assert "EncryptedEvidencePdfError" in caplog.text


def test_unexpected_error_is_not_automatically_retryable():
    failure = ExtractionErrorHandler().handle(RuntimeError("Unexpected issue"))

    assert failure.code == ExtractionErrorCode.INTERNAL_ERROR
    assert failure.retryable is False
