from datetime import UTC, datetime
from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.core.enums import ProcessingStepName, ProcessingStepStatus
from app.models.processing_step import ProcessingStep
from app.processing.pipeline import ProcessingPipeline
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS


def make_steps(job_id):
    return [
        ProcessingStep(
            job_id=job_id,
            step_name=name.value,
            status=ProcessingStepStatus.PENDING.value,
        )
        for name in ORDERED_PROCESSING_STEPS
    ]


def test_pipeline_resumes_from_failed_step(monkeypatch):
    job_id = uuid4()
    db = MagicMock()
    steps = make_steps(job_id)

    steps[0].status = ProcessingStepStatus.COMPLETED.value
    steps[1].status = ProcessingStepStatus.COMPLETED.value

    previous_completion = datetime.now(UTC)
    steps[2].status = ProcessingStepStatus.FAILED.value
    steps[2].error_message = "Previous failure"
    steps[2].completed_at = previous_completion

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    executor = MagicMock()

    def execute_step(step_name, context):
        if step_name == ProcessingStepName.NORMALIZE_CONTENT.value:
            assert steps[2].status == ProcessingStepStatus.RUNNING.value
            assert steps[2].error_message is None
            assert steps[2].completed_at is None

    executor.execute.side_effect = execute_step

    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_repository",
        repository,
    )
    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_executor",
        executor,
    )

    pipeline = ProcessingPipeline(db=db)
    pipeline.execute(job_id=job_id)

    executed_steps = [call.args[0] for call in executor.execute.call_args_list]

    assert executed_steps == [
        ProcessingStepName.NORMALIZE_CONTENT.value,
        ProcessingStepName.STORE_RESULT.value,
    ]

    assert all(step.status == ProcessingStepStatus.COMPLETED.value for step in steps)

    assert steps[2].error_message is None
    assert steps[2].completed_at is not None


def test_pipeline_stops_if_resumed_step_fails(monkeypatch):
    job_id = uuid4()
    db = MagicMock()
    steps = make_steps(job_id)

    steps[0].status = ProcessingStepStatus.COMPLETED.value
    steps[1].status = ProcessingStepStatus.COMPLETED.value
    steps[2].status = ProcessingStepStatus.FAILED.value

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    executor = MagicMock()
    executor.execute.side_effect = RuntimeError("Retry failed")

    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_repository",
        repository,
    )
    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_executor",
        executor,
    )

    pipeline = ProcessingPipeline(db=db)

    with pytest.raises(RuntimeError, match="Retry failed"):
        pipeline.execute(job_id=job_id)

    assert executor.execute.call_count == 1
    assert executor.execute.call_args.args[0] == (
        ProcessingStepName.NORMALIZE_CONTENT.value
    )

    assert steps[0].status == ProcessingStepStatus.COMPLETED.value
    assert steps[1].status == ProcessingStepStatus.COMPLETED.value
    assert steps[2].status == ProcessingStepStatus.FAILED.value
    assert steps[2].error_message == "Retry failed"
    assert steps[3].status == ProcessingStepStatus.PENDING.value
