import json
import logging

from app.core.logging_config import JsonFormatter, configure_logging


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
