from unittest.mock import ANY, MagicMock, call
from uuid import uuid4

from app.processing.pipeline import ProcessingPipeline
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS
from app.core.enums import ProcessingStepStatus

def test_pipeline_executes_steps_in_correct_order(monkeypatch):
    db = MagicMock()
    job_id = uuid4()

    # Deliberately return steps in reverse order
    steps = [
        MagicMock(
            step_name=step_name.value,
            status=ProcessingStepStatus.PENDING.value,
        )
        for step_name in reversed(ORDERED_PROCESSING_STEPS)
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
    pipeline.execute(job_id=job_id)

    assert executor.execute.call_args_list == [
        call(step_name.value, ANY) for step_name in ORDERED_PROCESSING_STEPS
    ]


def test_pipeline_rejects_missing_required_step(monkeypatch):
    db = MagicMock()
    job_id = uuid4()

    repository = MagicMock()
    repository.list_by_job_id.return_value = []

    monkeypatch.setattr(
        "app.processing.pipeline.processing_step_repository",
        repository,
    )

    pipeline = ProcessingPipeline(db=db)

    import pytest

    with pytest.raises(RuntimeError, match="Required processing step"):
        pipeline.execute(job_id=job_id)
