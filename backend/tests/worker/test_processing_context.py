from uuid import uuid4

from app.core.enums import ProcessingStepName
from app.processing.context import ProcessingContext
from app.processing.step_executor import ProcessingStepExecutor


def test_processing_context_is_shared_between_steps():
    context = ProcessingContext(job_id=uuid4())
    executor = ProcessingStepExecutor()

    executor.execute(ProcessingStepName.LOAD_FILE.value, context)

    assert "file_content" in context.data

    executor.execute(
        ProcessingStepName.EXTRACT_CONTENT.value,
        context,
    )

    assert "file_content" in context.data
    assert "extracted_text" in context.data

    executor.execute(
        ProcessingStepName.NORMALIZE_CONTENT.value,
        context,
    )

    assert "normalized_text" in context.data

    executor.execute(
        ProcessingStepName.STORE_RESULT.value,
        context,
    )


def test_processing_jobs_have_independent_contexts():
    first_context = ProcessingContext(job_id=uuid4())
    second_context = ProcessingContext(job_id=uuid4())

    first_context.data["file_content"] = b"example"

    assert "file_content" not in second_context.data
