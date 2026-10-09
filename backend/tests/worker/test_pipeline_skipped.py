from unittest.mock import MagicMock
from uuid import uuid4

from app.core.enums import ProcessingStepName, ProcessingStepStatus
from app.processing.pipeline import ProcessingPipeline
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS


def test_pipeline_ignores_skipped_steps(monkeypatch):
    db = MagicMock()

    steps = [
        MagicMock(
            step_name=name.value,
            status=ProcessingStepStatus.PENDING.value,
        )
        for name in ORDERED_PROCESSING_STEPS
    ]

    # Mark EXTRACT_CONTENT as skipped
    steps[1].status = ProcessingStepStatus.SKIPPED.value

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
        ProcessingStepName.LOAD_FILE.value,
        ProcessingStepName.NORMALIZE_CONTENT.value,
        ProcessingStepName.STORE_RESULT.value,
    ]

    assert steps[1].status == ProcessingStepStatus.SKIPPED.value

    assert steps[0].status == ProcessingStepStatus.COMPLETED.value
    assert steps[2].status == ProcessingStepStatus.COMPLETED.value
    assert steps[3].status == ProcessingStepStatus.COMPLETED.value


def test_skipped_step_is_not_updated(monkeypatch):
    db = MagicMock()

    steps = [
        MagicMock(
            step_name=name.value,
            status=ProcessingStepStatus.SKIPPED.value,
        )
        for name in ORDERED_PROCESSING_STEPS
    ]

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

    assert all(step.status == ProcessingStepStatus.SKIPPED.value for step in steps)
