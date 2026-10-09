from unittest.mock import MagicMock
from uuid import uuid4

from app.core.enums import ProcessingStepStatus
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS
from app.workers.evidence_worker import EvidenceWorker


def test_initialize_required_processing_steps(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    job_id = uuid4()

    repository = MagicMock()
    repository.get_by_job_and_name.return_value = None

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    worker.initialize_processing_steps(job_id)

    assert worker.db.add.call_count == len(ORDERED_PROCESSING_STEPS)
    worker.db.commit.assert_called_once()

    created_steps = [call.args[0] for call in worker.db.add.call_args_list]

    assert [step.step_name for step in created_steps] == [
        name.value for name in ORDERED_PROCESSING_STEPS
    ]

    assert all(
        step.status == ProcessingStepStatus.PENDING.value for step in created_steps
    )


def test_initialize_steps_does_not_duplicate_existing_steps(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    repository = MagicMock()
    repository.get_by_job_and_name.return_value = MagicMock()

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    worker.initialize_processing_steps(uuid4())

    worker.db.add.assert_not_called()
    worker.db.commit.assert_called_once()
