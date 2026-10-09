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
    def __init__(self, db: Session) -> None:
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
        context = ProcessingContext(job_id=job_id)

        steps = processing_step_repository.list_by_job_id(
            db=self.db,
            job_id=job_id,
        )
        steps_by_name = {step.step_name: step for step in steps}

        for step_name in ORDERED_PROCESSING_STEPS:
            step = steps_by_name.get(step_name.value)

            if step is None:
                raise RuntimeError(
                    f"Required processing step {step_name.value} "
                    f"is missing for job {job_id}"
                )

            step_logger = JobLoggerAdapter(
                logger,
                {
                    "job_id": str(job_id),
                    "step_name": step.step_name,
                },
            )

            if not self.should_execute_step(step):
                step_logger.info(
                    "Processing step skipped",
                    extra={
                        "event": "processing_step_skipped",
                    },
                )
                continue

            if step.status == ProcessingStepStatus.FAILED.value:
                step_logger.info(
                    "Retrying previously failed processing step",
                    extra={
                        "event": "processing_step_retry",
                    },
                )
                step.error_message = None
                step.completed_at = None

            previous_status = step.status
            self._mark_running(step)

            step_logger.info(
                "Processing step status changed",
                extra={
                    "event": "processing_step_status_changed",
                    "previous_status": previous_status,
                    "new_status": step.status,
                },
            )

            step_logger.info(
                "Processing step starting",
                extra={"event": "processing_step_started"},
            )

            try:
                processing_step_executor.execute(
                    step.step_name,
                    context,
                )
            except Exception as exc:
                previous_status = step.status
                self._mark_failed(
                    step=step,
                    error_message=str(exc),
                )

                step_logger.error(
                    "Processing step status changed",
                    extra={
                        "event": "processing_step_status_changed",
                        "previous_status": previous_status,
                        "new_status": step.status,
                    },
                )

                step_logger.error(
                    "Processing step failed: %s",
                    str(exc),
                    extra={"event": "processing_step_failed"},
                )
                raise

            previous_status = step.status
            self._mark_completed(step)

            step_logger.info(
                "Processing step status changed",
                extra={
                    "event": "processing_step_status_changed",
                    "previous_status": previous_status,
                    "new_status": step.status,
                },
            )

            step_logger.info(
                "Processing step completed successfully",
                extra={"event": "processing_step_completed"},
            )

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

    def _mark_completed(self, step: ProcessingStep) -> None:
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
