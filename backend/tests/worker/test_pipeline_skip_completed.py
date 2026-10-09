from unittest.mock import MagicMock
from uuid import uuid4

from app.core.enums import ProcessingStepName, ProcessingStepStatus
from app.processing.pipeline import ProcessingPipeline
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS


def test_pipeline_skips_completed_steps(monkeypatch):
    db = MagicMock()

    steps = [
        MagicMock(
            step_name=name.value,
            status=ProcessingStepStatus.PENDING.value,
        )
        for name in ORDERED_PROCESSING_STEPS
    ]

    steps[0].status = ProcessingStepStatus.COMPLETED.value
    steps[1].status = ProcessingStepStatus.COMPLETED.value
    steps[2].status = ProcessingStepStatus.FAILED.value

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    executor = MagicMock()

    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_repository",
        repository,
    )
    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_executor",
        executor,
    )

    pipeline = ProcessingPipeline(db=db)
    pipeline.execute(job_id=uuid4())

    executed_steps = [call.args[0] for call in executor.execute.call_args_list]

    assert executed_steps == [
        ProcessingStepName.NORMALIZE_CONTENT.value,
        ProcessingStepName.STORE_RESULT.value,
    ]

    assert all(step.status == ProcessingStepStatus.COMPLETED.value for step in steps)

    # Only the two steps that needed execution were updated.
    assert repository.update.call_count == 4


def test_completed_steps_remain_unchanged(monkeypatch):
    db = MagicMock()

    steps = [
        MagicMock(
            step_name=name.value,
            status=ProcessingStepStatus.COMPLETED.value,
        )
        for name in ORDERED_PROCESSING_STEPS
    ]

    original_timestamps = [step.completed_at for step in steps]

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    executor = MagicMock()

    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_repository",
        repository,
    )
    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_executor",
        executor,
    )

    pipeline = ProcessingPipeline(db=db)
    pipeline.execute(job_id=uuid4())

    executor.execute.assert_not_called()
    repository.update.assert_not_called()
    db.commit.assert_not_called()

    for step, original_timestamp in zip(
        steps,
        original_timestamps,
        strict=True,
    ):
        assert step.status == ProcessingStepStatus.COMPLETED.value
        assert step.completed_at == original_timestamp
