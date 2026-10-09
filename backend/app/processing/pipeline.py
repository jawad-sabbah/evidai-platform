import logging
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enums import ProcessingStepStatus
from app.core.logging_config import JobLoggerAdapter
from app.models.processing_step import ProcessingStep
from app.processing.context import ProcessingContext
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS
from app.processing.step_executor import processing_step_executor
from app.repositories.processing_step_repository import (
    processing_step_repository,
)

logger = logging.getLogger("app.pipeline")


class ProcessingPipeline:
    def __init__(
        self,
        db: Session,
    ) -> None:
        self.db = db

    @staticmethod
    def should_execute_step(step: ProcessingStep) -> bool:
        if step.status in (
            ProcessingStepStatus.COMPLETED.value,
            ProcessingStepStatus.SKIPPED.value,
        ):
            return False

        if step.status in (
            ProcessingStepStatus.PENDING.value,
            ProcessingStepStatus.FAILED.value,
        ):
            return True

        raise RuntimeError(
            f"Processing step {step.step_name} cannot be executed "
            f"from status {step.status}"
        )

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

            # Create structured logger for this specific step
            step_logger = JobLoggerAdapter(
                logger,
                {
                    "job_id": str(job_id),
                    "step_name": step.step_name,
                },
            )

            # Skip already completed or explicitly skipped steps
            if not self.should_execute_step(step):
                step_logger.info(
                    "Processing step skipped because execution is not required",
                    extra={"event": "processing_step_skipped"},
                )
                continue

            # A failed step is eligible for another attempt.
            # Reset its previous execution metadata before retrying.
            if step.status == ProcessingStepStatus.FAILED.value:
                step.error_message = None
                step.completed_at = None

            step_logger.info(
                "Processing step starting",
                extra={"event": "processing_step_started"},
            )

            self._mark_running(step)

            try:
                processing_step_executor.execute(
                    step.step_name,
                    context,
                )

                self._mark_completed(step)

                step_logger.info(
                    "Processing step completed successfully",
                    extra={"event": "processing_step_completed"},
                )

            except Exception as exc:
                self._mark_failed(
                    step=step,
                    error_message=str(exc),
                )

                step_logger.error(
                    "Processing step failed: %s",
                    str(exc),
                    extra={"event": "processing_step_failed"},
                )
                raise

    def _mark_running(self, step: ProcessingStep) -> None:
        step.status = ProcessingStepStatus.RUNNING.value
        step.started_at = datetime.now(UTC)
        step.completed_at = None
        step.error_message = None

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
