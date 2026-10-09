from datetime import UTC, datetime
from unittest.mock import MagicMock
from uuid import uuid4

from app.core.enums import ProcessingStepStatus
from app.models.processing_step import ProcessingStep
from app.processing.pipeline import ProcessingPipeline


def test_running_step_clears_previous_failure():
    db = MagicMock()
    pipeline = ProcessingPipeline(db=db)

    step = ProcessingStep(
        job_id=uuid4(),
        step_name="NORMALIZE_CONTENT",
        status=ProcessingStepStatus.FAILED.value,
        error_message="Previous failure",
        completed_at=datetime.now(UTC),
    )

    pipeline._mark_running(step)

    assert step.status == ProcessingStepStatus.RUNNING.value
    assert step.started_at is not None
    assert step.completed_at is None
    assert step.error_message is None
    db.commit.assert_called_once()


def test_completed_step_has_completion_timestamp():
    db = MagicMock()
    pipeline = ProcessingPipeline(db=db)

    step = ProcessingStep(
        job_id=uuid4(),
        step_name="LOAD_FILE",
        status=ProcessingStepStatus.RUNNING.value,
    )

    pipeline._mark_completed(step)

    assert step.status == ProcessingStepStatus.COMPLETED.value
    assert step.completed_at is not None
    db.commit.assert_called_once()


def test_failed_step_records_error_and_timestamp():
    db = MagicMock()
    pipeline = ProcessingPipeline(db=db)

    step = ProcessingStep(
        job_id=uuid4(),
        step_name="EXTRACT_CONTENT",
        status=ProcessingStepStatus.RUNNING.value,
    )

    pipeline._mark_failed(
        step=step,
        error_message="Extraction failed",
    )

    assert step.status == ProcessingStepStatus.FAILED.value
    assert step.error_message == "Extraction failed"
    assert step.completed_at is not None
    db.commit.assert_called_once()