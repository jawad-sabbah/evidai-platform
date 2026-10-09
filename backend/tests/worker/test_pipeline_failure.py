from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.core.enums import ProcessingStepName, ProcessingStepStatus
from app.processing.pipeline import ProcessingPipeline
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS


def test_pipeline_stops_when_required_step_fails(monkeypatch):
    db = MagicMock()
    job_id = uuid4()

    steps = [
        MagicMock(
            step_name=step_name.value,
            status=ProcessingStepStatus.PENDING.value,
        )
        for step_name in ORDERED_PROCESSING_STEPS
    ]

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    executor = MagicMock()

    def execute_step(step_name, context):
        if step_name == ProcessingStepName.EXTRACT_CONTENT.value:
            raise RuntimeError("Content extraction failed")

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

    with pytest.raises(RuntimeError, match="Content extraction failed"):
        pipeline.execute(job_id=job_id)

    # Only LOAD_FILE and EXTRACT_CONTENT were attempted.
    executed_steps = [call.args[0] for call in executor.execute.call_args_list]

    assert executed_steps == [
        ProcessingStepName.LOAD_FILE.value,
        ProcessingStepName.EXTRACT_CONTENT.value,
    ]

    # First step completed successfully.
    assert steps[0].status == ProcessingStepStatus.COMPLETED.value

    # Second step failed.
    assert steps[1].status == ProcessingStepStatus.FAILED.value
    assert steps[1].error_message == "Content extraction failed"
    assert steps[1].completed_at is not None

    # Remaining steps were never executed.
    assert steps[2].status == ProcessingStepStatus.PENDING.value
    assert steps[3].status == ProcessingStepStatus.PENDING.value


def test_pipeline_stops_if_first_step_fails(monkeypatch):
    db = MagicMock()

    steps = [
        MagicMock(
            step_name=step_name.value,
            status=ProcessingStepStatus.PENDING.value,
        )
        for step_name in ORDERED_PROCESSING_STEPS
    ]

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    executor = MagicMock()
    executor.execute.side_effect = RuntimeError("File loading failed")

    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_repository",
        repository,
    )
    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_executor",
        executor,
    )

    pipeline = ProcessingPipeline(db=db)

    with pytest.raises(RuntimeError, match="File loading failed"):
        pipeline.execute(job_id=uuid4())

    assert executor.execute.call_count == 1

    assert steps[0].status == ProcessingStepStatus.FAILED.value

    for step in steps[1:]:
        assert step.status == ProcessingStepStatus.PENDING.value
