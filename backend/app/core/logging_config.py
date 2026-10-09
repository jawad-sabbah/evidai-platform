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

        if hasattr(record, "event"):
            log_data["event"] = record.event

        if hasattr(record, "job_id"):
            log_data["job_id"] = str(record.job_id)

        if hasattr(record, "step_name"):
            log_data["step_name"] = str(record.step_name)

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def configure_logging() -> None:
    logger = logging.getLogger("app")

    if logger.handlers:
        return

    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False


class JobLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        kwargs["extra"] = {
            **kwargs.get("extra", {}),
            **self.extra,
        }
        return msg, kwargs
