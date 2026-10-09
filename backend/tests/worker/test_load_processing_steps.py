from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.core.enums import ProcessingStepStatus
from app.workers.evidence_worker import EvidenceWorker


def test_load_existing_processing_steps(monkeypatch):
    worker = EvidenceWorker()
    worker.db = MagicMock()

    job_id = uuid4()

    existing_steps = [
        MagicMock(
            step_name="LOAD_FILE",
            status=ProcessingStepStatus.COMPLETED.value,
        ),
        MagicMock(
            step_name="EXTRACT_CONTENT",
            status=ProcessingStepStatus.FAILED.value,
        ),
    ]

    repository = MagicMock()
    repository.list_by_job_id.return_value = existing_steps

    monkeypatch.setattr(
        "app.workers.evidence_worker.processing_step_repository",
        repository,
    )

    result = worker.load_processing_steps(job_id)

    assert result == existing_steps

    repository.list_by_job_id.assert_called_once_with(
        db=worker.db,
        job_id=job_id,
    )

    repository.update.assert_not_called()
    worker.db.commit.assert_not_called()


def test_load_processing_steps_requires_session():
    worker = EvidenceWorker()

    with pytest.raises(
        RuntimeError,
        match="Worker database session is not initialized",
    ):
        worker.load_processing_steps(uuid4())
