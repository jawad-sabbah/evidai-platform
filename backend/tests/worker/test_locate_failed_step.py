from unittest.mock import MagicMock

from app.core.enums import ProcessingStepStatus
from app.workers.evidence_worker import EvidenceWorker


def create_step(name: str, status: str):
    return MagicMock(
        step_name=name,
        status=status,
    )


def test_locate_failed_step():
    worker = EvidenceWorker()

    steps = [
        create_step(
            "LOAD_FILE",
            ProcessingStepStatus.COMPLETED.value,
        ),
        create_step(
            "EXTRACT_CONTENT",
            ProcessingStepStatus.COMPLETED.value,
        ),
        create_step(
            "NORMALIZE_CONTENT",
            ProcessingStepStatus.FAILED.value,
        ),
        create_step(
            "STORE_RESULT",
            ProcessingStepStatus.PENDING.value,
        ),
    ]

    failed_step = worker.locate_failed_step(steps)

    assert failed_step is steps[2]
    assert failed_step.step_name == "NORMALIZE_CONTENT"


def test_locate_failed_step_when_none_failed():
    worker = EvidenceWorker()

    steps = [
        create_step(
            "LOAD_FILE",
            ProcessingStepStatus.COMPLETED.value,
        ),
        create_step(
            "EXTRACT_CONTENT",
            ProcessingStepStatus.COMPLETED.value,
        ),
    ]

    assert worker.locate_failed_step(steps) is None


def test_locate_failed_step_with_empty_list():
    worker = EvidenceWorker()

    assert worker.locate_failed_step([]) is None


def test_locate_first_failed_step_in_pipeline_order():
    worker = EvidenceWorker()

    # Deliberately provide records in reverse order
    steps = [
        create_step(
            "STORE_RESULT",
            ProcessingStepStatus.FAILED.value,
        ),
        create_step(
            "NORMALIZE_CONTENT",
            ProcessingStepStatus.FAILED.value,
        ),
        create_step(
            "EXTRACT_CONTENT",
            ProcessingStepStatus.COMPLETED.value,
        ),
        create_step(
            "LOAD_FILE",
            ProcessingStepStatus.COMPLETED.value,
        ),
    ]

    failed_step = worker.locate_failed_step(steps)

    assert failed_step.step_name == "NORMALIZE_CONTENT"
