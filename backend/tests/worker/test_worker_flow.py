from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.core.enums import ProcessingJobStatus
from app.workers.evidence_worker import EvidenceWorker


@pytest.fixture
def worker_setup():
    job_id = uuid4()
    db = MagicMock()

    job = MagicMock()
    job.id = job_id
    job.status = ProcessingJobStatus.QUEUED.value
    job.attempt_count = 1
    job.max_attempts = 3

    return job_id, db, job


@pytest.mark.parametrize(
    "status",
    [
        ProcessingJobStatus.RUNNING.value,
        ProcessingJobStatus.COMPLETED.value,
        ProcessingJobStatus.CANCELLED.value,
        ProcessingJobStatus.FAILED.value,
    ],
)
def test_duplicate_or_terminal_job_is_skipped(worker_setup, status):
    job_id, db, job = worker_setup
    job.status = status

    with (
        patch(
            "app.workers.evidence_worker.SessionLocal",
            return_value=db,
        ),
        patch("app.workers.evidence_worker.processing_job_repository") as repository,
        patch("app.workers.evidence_worker.ProcessingPipeline") as pipeline_class,
    ):
        repository.get_fresh_by_id.return_value = job

        EvidenceWorker().start(job_id)

        repository.claim_job.assert_not_called()
        pipeline_class.assert_not_called()
        db.close.assert_called_once()


def test_deleted_job_is_skipped(worker_setup):
    job_id, db, _ = worker_setup

    with (
        patch(
            "app.workers.evidence_worker.SessionLocal",
            return_value=db,
        ),
        patch("app.workers.evidence_worker.processing_job_repository") as repository,
    ):
        repository.get_fresh_by_id.return_value = None

        EvidenceWorker().start(job_id)

        repository.claim_job.assert_not_called()
        db.close.assert_called_once()


def test_job_claimed_by_another_worker_is_skipped(worker_setup):
    job_id, db, job = worker_setup

    with (
        patch(
            "app.workers.evidence_worker.SessionLocal",
            return_value=db,
        ),
        patch("app.workers.evidence_worker.processing_job_repository") as repository,
        patch("app.workers.evidence_worker.ProcessingPipeline") as pipeline_class,
    ):
        repository.get_fresh_by_id.return_value = job
        repository.claim_job.return_value = None

        EvidenceWorker().start(job_id)

        pipeline_class.assert_not_called()
        db.close.assert_called_once()


def test_successful_worker_marks_job_completed(worker_setup):
    job_id, db, job = worker_setup

    with (
        patch(
            "app.workers.evidence_worker.SessionLocal",
            return_value=db,
        ),
        patch("app.workers.evidence_worker.processing_job_repository") as repository,
        patch("app.workers.evidence_worker.ProcessingPipeline") as pipeline_class,
        patch.object(
            EvidenceWorker,
            "initialize_processing_steps",
        ),
        patch.object(
            EvidenceWorker,
            "load_processing_steps",
            return_value=[],
        ),
        patch.object(
            EvidenceWorker,
            "validate_processing_steps_completed",
        ),
    ):
        repository.get_fresh_by_id.return_value = job
        repository.claim_job.return_value = job

        EvidenceWorker().start(job_id)

        pipeline_class.return_value.execute.assert_called_once_with(job_id=job_id)
        assert job.status == ProcessingJobStatus.COMPLETED.value
        assert job.completed_at is not None
        db.commit.assert_called()
        db.close.assert_called_once()


@pytest.mark.parametrize(
    ("attempt_count", "max_attempts", "expected_status"),
    [
        (1, 3, ProcessingJobStatus.QUEUED.value),
        (3, 3, ProcessingJobStatus.FAILED.value),
    ],
)
def test_worker_failure_updates_job_status(
    worker_setup,
    attempt_count,
    max_attempts,
    expected_status,
):
    job_id, db, job = worker_setup
    job.attempt_count = attempt_count
    job.max_attempts = max_attempts

    with (
        patch(
            "app.workers.evidence_worker.SessionLocal",
            return_value=db,
        ),
        patch("app.workers.evidence_worker.processing_job_repository") as repository,
        patch("app.workers.evidence_worker.ProcessingPipeline") as pipeline_class,
        patch.object(
            EvidenceWorker,
            "initialize_processing_steps",
        ),
        patch.object(
            EvidenceWorker,
            "load_processing_steps",
            return_value=[],
        ),
    ):
        repository.get_fresh_by_id.return_value = job
        repository.claim_job.return_value = job
        pipeline_class.return_value.execute.side_effect = RuntimeError(
            "Processing failed"
        )

        with pytest.raises(RuntimeError, match="Processing failed"):
            EvidenceWorker().start(job_id)

        assert job.status == expected_status
        repository.update.assert_called()
        db.close.assert_called_once()
