from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.core.enums import ProcessingStepStatus
from app.processing.pipeline import ProcessingPipeline
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS


def make_steps(status=ProcessingStepStatus.PENDING.value):
    steps = []

    for name in ORDERED_PROCESSING_STEPS:
        step = MagicMock()
        step.step_name = name.value
        step.status = status
        step.error_message = None
        step.completed_at = None
        steps.append(step)

    return steps


@pytest.fixture
def pipeline_setup():
    db = MagicMock()
    pipeline = ProcessingPipeline(db=db)
    job_id = uuid4()
    return pipeline, db, job_id


def test_successful_pipeline_completes_all_steps(pipeline_setup):
    pipeline, db, job_id = pipeline_setup
    steps = make_steps()

    with (
        patch("app.processing.pipeline.processing_step_repository") as repository,
        patch("app.processing.pipeline.processing_step_executor") as executor,
    ):
        repository.list_by_job_id.return_value = steps

        pipeline.execute(job_id)

        assert executor.execute.call_count == len(steps)
        assert db.commit.call_count == len(steps) * 2

        for step in steps:
            assert step.status == ProcessingStepStatus.COMPLETED.value


def test_pipeline_failure_marks_step_failed(pipeline_setup):
    pipeline, db, job_id = pipeline_setup
    steps = make_steps()

    with (
        patch("app.processing.pipeline.processing_step_repository") as repository,
        patch("app.processing.pipeline.processing_step_executor") as executor,
    ):
        repository.list_by_job_id.return_value = steps
        executor.execute.side_effect = RuntimeError("Extraction failed")

        with pytest.raises(RuntimeError, match="Extraction failed"):
            pipeline.execute(job_id)

        assert steps[0].status == ProcessingStepStatus.FAILED.value
        assert steps[0].error_message == "Extraction failed"
        assert db.commit.call_count == 2


def test_retry_skips_completed_steps(pipeline_setup):
    pipeline, _, job_id = pipeline_setup
    steps = make_steps()

    steps[0].status = ProcessingStepStatus.COMPLETED.value
    steps[1].status = ProcessingStepStatus.COMPLETED.value
    steps[2].status = ProcessingStepStatus.FAILED.value

    with (
        patch("app.processing.pipeline.processing_step_repository") as repository,
        patch("app.processing.pipeline.processing_step_executor") as executor,
    ):
        repository.list_by_job_id.return_value = steps

        pipeline.execute(job_id)

        executed_names = [call.args[0] for call in executor.execute.call_args_list]

        assert executed_names == [step.step_name for step in steps[2:]]

        assert steps[2].status == ProcessingStepStatus.COMPLETED.value
        assert steps[2].error_message is None


def test_completed_pipeline_does_not_execute_again(pipeline_setup):
    pipeline, db, job_id = pipeline_setup
    steps = make_steps(ProcessingStepStatus.COMPLETED.value)

    with (
        patch("app.processing.pipeline.processing_step_repository") as repository,
        patch("app.processing.pipeline.processing_step_executor") as executor,
    ):
        repository.list_by_job_id.return_value = steps

        pipeline.execute(job_id)

        executor.execute.assert_not_called()
        db.commit.assert_not_called()


def test_missing_step_raises_error(pipeline_setup):
    pipeline, _, job_id = pipeline_setup

    with patch("app.processing.pipeline.processing_step_repository") as repository:
        repository.list_by_job_id.return_value = []

        with pytest.raises(RuntimeError, match="missing"):
            pipeline.execute(job_id)


def test_running_step_cannot_be_executed():
    step = MagicMock()
    step.step_name = "LOAD_FILE"
    step.status = ProcessingStepStatus.RUNNING.value

    with pytest.raises(RuntimeError, match="cannot be executed"):
        ProcessingPipeline.should_execute_step(step)
