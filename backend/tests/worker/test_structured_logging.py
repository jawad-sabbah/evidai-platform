import json
import logging

from app.core.logging_config import JobLoggerAdapter, JsonFormatter, configure_logging


def test_json_formatter():
    formatter = JsonFormatter()

    record = logging.LogRecord(
        name="app.worker",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="Worker started",
        args=(),
        exc_info=None,
    )

    record.event = "worker_started"

    result = json.loads(formatter.format(record))

    assert result["level"] == "INFO"
    assert result["logger"] == "app.worker"
    assert result["message"] == "Worker started"
    assert result["event"] == "worker_started"
    assert "timestamp" in result


def test_configure_logging_is_idempotent():
    logger = logging.getLogger("app")
    original_handlers = logger.handlers[:]
    original_level = logger.level
    original_propagate = logger.propagate

    try:
        logger.handlers = []

        configure_logging()
        first_handler_count = len(logger.handlers)

        configure_logging()

        assert len(logger.handlers) == first_handler_count
        assert first_handler_count == 1

    finally:
        logger.handlers = original_handlers
        logger.setLevel(original_level)
        logger.propagate = original_propagate


def test_json_formatter_includes_step_name():
    formatter = JsonFormatter()

    record = logging.LogRecord(
        name="app.pipeline",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="Processing step starting",
        args=(),
        exc_info=None,
    )

    record.event = "processing_step_started"
    record.job_id = "test-job-id"
    record.step_name = "EXTRACT_CONTENT"

    result = json.loads(formatter.format(record))

    assert result["event"] == "processing_step_started"
    assert result["job_id"] == "test-job-id"
    assert result["step_name"] == "EXTRACT_CONTENT"


def test_step_logger_preserves_structured_fields():
    test_logger = logging.getLogger("app.pipeline.test")

    adapter = JobLoggerAdapter(
        test_logger,
        {
            "job_id": "test-job-id",
            "step_name": "EXTRACT_CONTENT",
        },
    )

    message, kwargs = adapter.process(
        "Processing step starting",
        {"extra": {"event": "processing_step_started"}},
    )

    assert message == "Processing step starting"
    assert kwargs["extra"] == {
        "event": "processing_step_started",
        "job_id": "test-job-id",
        "step_name": "EXTRACT_CONTENT",
    }
