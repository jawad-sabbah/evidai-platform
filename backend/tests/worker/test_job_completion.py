from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.core.enums import ProcessingStepStatus
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS
from app.workers.evidence_worker import EvidenceWorker


def create_steps(status):
    return [
        MagicMock(
            step_name=name.value,
            status=status,
        )
        for name in ORDERED_PROCESSING_STEPS
    ]


def test_all_required_steps_completed(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    repository = MagicMock()
    repository.list_by_job_id.return_value = create_steps(
        ProcessingStepStatus.COMPLETED.value
    )

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    worker.validate_processing_steps_completed(uuid4())


def test_pending_step_prevents_completion(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    steps = create_steps(ProcessingStepStatus.COMPLETED.value)
    steps[1].status = ProcessingStepStatus.PENDING.value

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    with pytest.raises(RuntimeError, match="is not completed"):
        worker.validate_processing_steps_completed(uuid4())


def test_failed_step_prevents_completion(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    steps = create_steps(ProcessingStepStatus.COMPLETED.value)
    steps[2].status = ProcessingStepStatus.FAILED.value

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    with pytest.raises(RuntimeError, match="is not completed"):
        worker.validate_processing_steps_completed(uuid4())


def test_skipped_required_step_prevents_completion(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    steps = create_steps(ProcessingStepStatus.COMPLETED.value)
    steps[1].status = ProcessingStepStatus.SKIPPED.value

    repository = MagicMock()
    repository.list_by_job_id.return_value = steps

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    with pytest.raises(RuntimeError, match="is not completed"):
        worker.validate_processing_steps_completed(uuid4())


def test_missing_required_step_prevents_completion(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    repository = MagicMock()
    repository.list_by_job_id.return_value = []

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    with pytest.raises(RuntimeError, match="is missing"):
        worker.validate_processing_steps_completed(uuid4())
