from app.core.enums import ProcessingStepName

ORDERED_PROCESSING_STEPS: tuple[ProcessingStepName, ...] = (
    ProcessingStepName.LOAD_FILE,
    ProcessingStepName.EXTRACT_CONTENT,
    ProcessingStepName.NORMALIZE_CONTENT,
    ProcessingStepName.STORE_RESULT,
)
