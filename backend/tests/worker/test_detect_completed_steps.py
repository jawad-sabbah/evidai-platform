from unittest.mock import MagicMock

from app.core.enums import ProcessingStepStatus
from app.workers.evidence_worker import EvidenceWorker


def test_detect_completed_steps():
    worker = EvidenceWorker()

    steps = [
        MagicMock(
            step_name="LOAD_FILE",
            status=ProcessingStepStatus.COMPLETED.value,
        ),
        MagicMock(
            step_name="EXTRACT_CONTENT",
            status=ProcessingStepStatus.COMPLETED.value,
        ),
        MagicMock(
            step_name="NORMALIZE_CONTENT",
            status=ProcessingStepStatus.FAILED.value,
        ),
        MagicMock(
            step_name="STORE_RESULT",
            status=ProcessingStepStatus.PENDING.value,
        ),
    ]

    completed_steps = worker.detect_completed_steps(steps)

    assert completed_steps == {
        "LOAD_FILE",
        "EXTRACT_CONTENT",
    }


def test_detect_completed_steps_when_none_completed():
    worker = EvidenceWorker()

    steps = [
        MagicMock(
            step_name="LOAD_FILE",
            status=ProcessingStepStatus.PENDING.value,
        ),
        MagicMock(
            step_name="EXTRACT_CONTENT",
            status=ProcessingStepStatus.FAILED.value,
        ),
    ]

    assert worker.detect_completed_steps(steps) == set()


def test_detect_completed_steps_with_empty_list():
    worker = EvidenceWorker()

    assert worker.detect_completed_steps([]) == set()
