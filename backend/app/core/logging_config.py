import json
import logging
from datetime import UTC, datetime


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for field in (
            "event",
            "job_id",
            "step_name",
            "previous_status",
            "new_status",
            "attempt_count",
            "max_attempts",
        ):
            if hasattr(record, field):
                value = getattr(record, field)
                log_data[field] = (
                    str(value) if field in ("job_id", "step_name") else value
                )

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


class JobLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        kwargs["extra"] = {
            **kwargs.get("extra", {}),
            **self.extra,
        }
        return msg, kwargs


def configure_logging() -> None:
    app_logger = logging.getLogger("app")

    if app_logger.handlers:
        return

    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    app_logger.addHandler(handler)
    app_logger.setLevel(logging.INFO)
    app_logger.propagate = False
