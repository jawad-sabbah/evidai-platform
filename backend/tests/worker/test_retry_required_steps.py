from uuid import uuid4

import pytest

from app.core.enums import ProcessingStepStatus
from app.models.processing_step import ProcessingStep
from app.processing.pipeline import ProcessingPipeline


@pytest.mark.parametrize(
    ("status", "expected"),
    [
        (ProcessingStepStatus.PENDING.value, True),
        (ProcessingStepStatus.FAILED.value, True),
        (ProcessingStepStatus.COMPLETED.value, False),
        (ProcessingStepStatus.SKIPPED.value, False),
    ],
)
def test_should_execute_step(status, expected):
    step = ProcessingStep(
        job_id=uuid4(),
        step_name="LOAD_FILE",
        status=status,
    )

    assert ProcessingPipeline.should_execute_step(step) is expected


def test_running_step_is_not_retried_automatically():
    step = ProcessingStep(
        job_id=uuid4(),
        step_name="LOAD_FILE",
        status=ProcessingStepStatus.RUNNING.value,
    )

    with pytest.raises(RuntimeError, match="cannot be executed"):
        ProcessingPipeline.should_execute_step(step)


def test_unknown_status_is_rejected():
    step = ProcessingStep(
        job_id=uuid4(),
        step_name="LOAD_FILE",
        status="UNKNOWN",
    )

    with pytest.raises(RuntimeError, match="cannot be executed"):
        ProcessingPipeline.should_execute_step(step)
