import json
import logging
from datetime import datetime
from uuid import uuid4

import pytest

from app.core.logging_config import (
    JobLoggerAdapter,
    JsonFormatter,
    configure_logging,
)


def make_record(
    message="Test message",
    level=logging.INFO,
    **extra,
):
    record = logging.LogRecord(
        name="app.worker",
        level=level,
        pathname=__file__,
        lineno=1,
        msg=message,
        args=(),
        exc_info=None,
    )

    for key, value in extra.items():
        setattr(record, key, value)

    return record


def test_json_formatter_produces_valid_json():
    result = json.loads(JsonFormatter().format(make_record()))

    assert result["message"] == "Test message"
    assert result["level"] == "INFO"
    assert result["logger"] == "app.worker"


def test_json_formatter_includes_iso_timestamp():
    result = json.loads(JsonFormatter().format(make_record()))

    assert datetime.fromisoformat(result["timestamp"]).tzinfo is not None


@pytest.mark.parametrize(
    ("level", "expected"),
    [
        (logging.INFO, "INFO"),
        (logging.WARNING, "WARNING"),
        (logging.ERROR, "ERROR"),
    ],
)
def test_json_formatter_log_levels(level, expected):
    result = json.loads(JsonFormatter().format(make_record(level=level)))

    assert result["level"] == expected


def test_json_formatter_includes_event():
    result = json.loads(JsonFormatter().format(make_record(event="worker_started")))

    assert result["event"] == "worker_started"


def test_json_formatter_includes_job_id():
    job_id = uuid4()

    result = json.loads(JsonFormatter().format(make_record(job_id=str(job_id))))

    assert result["job_id"] == str(job_id)


def test_json_formatter_includes_step_name():
    result = json.loads(
        JsonFormatter().format(
            make_record(
                job_id="test-job",
                step_name="EXTRACT_CONTENT",
                event="processing_step_started",
            )
        )
    )

    assert result["job_id"] == "test-job"
    assert result["step_name"] == "EXTRACT_CONTENT"
    assert result["event"] == "processing_step_started"


def test_optional_fields_are_omitted():
    result = json.loads(JsonFormatter().format(make_record()))

    assert "event" not in result
    assert "job_id" not in result
    assert "step_name" not in result


def test_job_logger_adapter_preserves_event():
    adapter = JobLoggerAdapter(
        logging.getLogger("app.worker.test"),
        {"job_id": "test-job"},
    )

    _, kwargs = adapter.process(
        "Starting",
        {"extra": {"event": "worker_started"}},
    )

    assert kwargs["extra"]["job_id"] == "test-job"
    assert kwargs["extra"]["event"] == "worker_started"


def test_step_logger_adapter_preserves_fields():
    adapter = JobLoggerAdapter(
        logging.getLogger("app.pipeline.test"),
        {
            "job_id": "test-job",
            "step_name": "LOAD_FILE",
        },
    )

    _, kwargs = adapter.process(
        "Starting",
        {"extra": {"event": "processing_step_started"}},
    )

    assert kwargs["extra"] == {
        "event": "processing_step_started",
        "job_id": "test-job",
        "step_name": "LOAD_FILE",
    }


def test_configure_logging_is_idempotent():
    app_logger = logging.getLogger("app")

    original_handlers = app_logger.handlers[:]
    original_level = app_logger.level
    original_propagate = app_logger.propagate

    try:
        app_logger.handlers = []

        configure_logging()
        first_count = len(app_logger.handlers)

        configure_logging()

        assert first_count == 1
        assert len(app_logger.handlers) == 1
    finally:
        app_logger.handlers = original_handlers
        app_logger.setLevel(original_level)
        app_logger.propagate = original_propagate
