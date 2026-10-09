from app.core.enums import ProcessingStepName
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS


def test_processing_steps_have_correct_order():
    assert ORDERED_PROCESSING_STEPS == (
        ProcessingStepName.LOAD_FILE,
        ProcessingStepName.EXTRACT_CONTENT,
        ProcessingStepName.NORMALIZE_CONTENT,
        ProcessingStepName.STORE_RESULT,
    )


def test_processing_steps_are_unique():
    assert len(ORDERED_PROCESSING_STEPS) == len(set(ORDERED_PROCESSING_STEPS))
