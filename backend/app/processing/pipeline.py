from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enums import ProcessingStepStatus
from app.models.processing_step import ProcessingStep
from app.processing.context import ProcessingContext
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS
from app.processing.step_executor import processing_step_executor
from app.repositories.processing_step_repository import (
    processing_step_repository,
)


class ProcessingPipeline:
    def __init__(
        self,
        db: Session,
    ) -> None:
        self.db = db

    def execute(self, job_id: UUID) -> None:
        # Initialize the context
        context = ProcessingContext(job_id=job_id)

        steps = processing_step_repository.list_by_job_id(
            db=self.db,
            job_id=job_id,
        )

        # Map database steps by their names
        steps_by_name = {step.step_name: step for step in steps}

        # Execute steps according to the defined order
        for step_name in ORDERED_PROCESSING_STEPS:
            step = steps_by_name.get(step_name.value)

            if step is None:
                raise RuntimeError(
                    f"Required processing step {step_name.value} "
                    f"is missing for job {job_id}"
                )

            # Skip already completed or explicitly skipped steps
            if step.status in (
                ProcessingStepStatus.COMPLETED.value,
                ProcessingStepStatus.SKIPPED.value,
            ):
                continue

            # A failed step is eligible for another attempt.
            # Reset its previous execution metadata before retrying.
            if step.status == ProcessingStepStatus.FAILED.value:
                step.error_message = None
                step.completed_at = None

            self._mark_running(step)

            try:
                processing_step_executor.execute(
                    step.step_name,
                    context,
                )

                self._mark_completed(step)

            except Exception as exc:
                self._mark_failed(
                    step=step,
                    error_message=str(exc),
                )
                raise

    def _mark_running(
        self,
        step: ProcessingStep,
    ) -> None:
        step.status = ProcessingStepStatus.RUNNING.value
        step.started_at = datetime.now(UTC)

        processing_step_repository.update(
            db=self.db,
            processing_step=step,
        )

        self.db.commit()

    def _mark_completed(
        self,
        step: ProcessingStep,
    ) -> None:
        step.status = ProcessingStepStatus.COMPLETED.value
        step.completed_at = datetime.now(UTC)

        processing_step_repository.update(
            db=self.db,
            processing_step=step,
        )

        self.db.commit()

    def _mark_failed(
        self,
        step: ProcessingStep,
        error_message: str,
    ) -> None:
        step.status = ProcessingStepStatus.FAILED.value
        step.error_message = error_message
        step.completed_at = datetime.now(UTC)

        processing_step_repository.update(
            db=self.db,
            processing_step=step,
        )

        self.db.commit()
