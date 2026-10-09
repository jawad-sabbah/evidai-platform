import argparse
import logging
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enums import ProcessingJobStatus, ProcessingStepStatus
from app.core.logging_config import JobLoggerAdapter, configure_logging
from app.db.session import SessionLocal
from app.models.processing_step import ProcessingStep
from app.processing.pipeline import ProcessingPipeline
from app.processing.step_definitions import ORDERED_PROCESSING_STEPS
from app.repositories.processing_job_repository import (
    processing_job_repository,
)
from app.repositories.processing_step_repository import (
    processing_step_repository,
)

configure_logging()
logger = logging.getLogger("app.worker")


class EvidenceWorker:
    def __init__(self) -> None:
        self.db: Session | None = None

    def start(self, job_id: UUID) -> None:
        job_logger = JobLoggerAdapter(logger, {"job_id": str(job_id)})
        job_logger.info(
            "Evidence worker starting",
            extra={"event": "worker_started"},
        )

        self.db = SessionLocal()
        try:
            processing_job = processing_job_repository.get_fresh_by_id(
                db=self.db, job_id=job_id
            )

            if processing_job is None:
                job_logger.warning(
                    "Processing job no longer exists",
                    extra={"event": "job_not_found"},
                )
                return

            if processing_job.status == ProcessingJobStatus.RUNNING.value:
                job_logger.info(
                    "Processing job is already running",
                    extra={"event": "job_already_running"},
                )
                return

            if processing_job.status == ProcessingJobStatus.COMPLETED.value:
                job_logger.info(
                    "Processing job is already completed",
                    extra={"event": "job_already_completed"},
                )
                return

            if processing_job.status in (
                ProcessingJobStatus.CANCELLED.value,
                ProcessingJobStatus.FAILED.value,
            ):
                job_logger.info(
                    "Processing job has terminal status %s",
                    processing_job.status,
                    extra={"event": "job_terminal_status"},
                )
                return

            if processing_job.status != ProcessingJobStatus.QUEUED.value:
                job_logger.warning(
                    "Processing job has unexpected status %s",
                    processing_job.status,
                    extra={"event": "job_unexpected_status"},
                )
                return

            claimed_job = processing_job_repository.claim_job(db=self.db, job_id=job_id)
            if claimed_job is None:
                job_logger.info(
                    "Processing job claimed by another worker",
                    extra={"event": "job_claim_failed"},
                )
                return

            processing_job = claimed_job

            job_logger.info(
                "Processing job claimed",
                extra={
                    "event": "job_claimed",
                    "attempt_count": processing_job.attempt_count,
                    "max_attempts": processing_job.max_attempts,
                },
            )
            job_logger.info(
                "Processing job status changed",
                extra={
                    "event": "job_status_changed",
                    "previous_status": ProcessingJobStatus.QUEUED.value,
                    "new_status": ProcessingJobStatus.RUNNING.value,
                },
            )

            self.initialize_processing_steps(processing_job.id)
            existing_steps = self.load_processing_steps(processing_job.id)

            job_logger.info(
                "Loaded %s processing steps",
                len(existing_steps),
                extra={"event": "processing_steps_loaded"},
            )

            completed_steps = self.detect_completed_steps(existing_steps)
            job_logger.info(
                "Detected %s completed steps",
                len(completed_steps),
                extra={"event": "completed_steps_detected"},
            )

            failed_step = self.locate_failed_step(existing_steps)
            if failed_step is not None:
                job_logger.info(
                    "Previously failed step detected: %s",
                    failed_step.step_name,
                    extra={
                        "event": "failed_step_detected",
                        "step_name": failed_step.step_name,
                    },
                )

            pipeline = ProcessingPipeline(db=self.db)
            try:
                job_logger.info(
                    "Processing pipeline starting",
                    extra={"event": "pipeline_started"},
                )

                pipeline.execute(job_id=processing_job.id)
                self.validate_processing_steps_completed(job_id=processing_job.id)

                job_logger.info(
                    "Processing pipeline completed",
                    extra={"event": "pipeline_completed"},
                )
            except Exception:
                previous_status = processing_job.status

                if processing_job.attempt_count < processing_job.max_attempts:
                    processing_job.status = ProcessingJobStatus.QUEUED.value
                    processing_job.completed_at = None
                    retry_event = "job_retry_pending"
                    retry_message = "Job eligible for retry"
                    retry_level = logging.WARNING
                else:
                    processing_job.status = ProcessingJobStatus.FAILED.value
                    processing_job.completed_at = datetime.now(UTC)
                    retry_event = "job_max_attempts_reached"
                    retry_message = "Job exhausted retry attempts"
                    retry_level = logging.ERROR

                processing_job_repository.update(
                    db=self.db, processing_job=processing_job
                )
                self.db.commit()

                job_logger.log(
                    retry_level,
                    retry_message,
                    extra={
                        "event": retry_event,
                        "attempt_count": processing_job.attempt_count,
                        "max_attempts": processing_job.max_attempts,
                    },
                )
                job_logger.log(
                    retry_level,
                    "Processing job status changed",
                    extra={
                        "event": "job_status_changed",
                        "previous_status": previous_status,
                        "new_status": processing_job.status,
                    },
                )
                raise

            previous_status = processing_job.status
            processing_job.status = ProcessingJobStatus.COMPLETED.value
            processing_job.completed_at = datetime.now(UTC)

            processing_job_repository.update(db=self.db, processing_job=processing_job)
            self.db.commit()

            job_logger.info(
                "Processing job status changed",
                extra={
                    "event": "job_status_changed",
                    "previous_status": previous_status,
                    "new_status": processing_job.status,
                },
            )
            job_logger.info(
                "Processing job completed successfully",
                extra={"event": "job_completed"},
            )

        except KeyboardInterrupt:
            self.db.rollback()
            job_logger.warning(
                "Evidence worker interrupted",
                extra={"event": "worker_interrupted"},
            )
        except Exception:
            self.db.rollback()
            job_logger.exception(
                "Evidence worker failed",
                extra={"event": "worker_failed"},
            )
            raise
        finally:
            self.db.close()
            self.db = None
            job_logger.info(
                "Evidence worker stopped",
                extra={"event": "worker_stopped"},
            )

    def load_processing_steps(self, job_id: UUID) -> list[ProcessingStep]:
        if self.db is None:
            raise RuntimeError("Worker database session is not initialized")
        return processing_step_repository.list_by_job_id(db=self.db, job_id=job_id)

    def detect_completed_steps(self, steps: list[ProcessingStep]) -> set[str]:
        return {
            step.step_name
            for step in steps
            if step.status == ProcessingStepStatus.COMPLETED.value
        }

    def locate_failed_step(self, steps: list[ProcessingStep]) -> ProcessingStep | None:
        steps_by_name = {step.step_name: step for step in steps}
        for step_name in ORDERED_PROCESSING_STEPS:
            step = steps_by_name.get(step_name.value)
            if step is not None and step.status == ProcessingStepStatus.FAILED.value:
                return step
        return None

    def initialize_processing_steps(self, job_id: UUID) -> None:
        if self.db is None:
            raise RuntimeError("Worker database session is not initialized")

        for step_name in ORDERED_PROCESSING_STEPS:
            existing_step = processing_step_repository.get_by_job_and_name(
                db=self.db,
                job_id=job_id,
                step_name=step_name.value,
            )
            if existing_step is not None:
                continue

            self.db.add(
                ProcessingStep(
                    job_id=job_id,
                    step_name=step_name.value,
                    status=ProcessingStepStatus.PENDING.value,
                )
            )
        self.db.commit()

    def validate_processing_steps_completed(self, job_id: UUID) -> None:
        if self.db is None:
            raise RuntimeError("Worker database session is not initialized")

        steps = processing_step_repository.list_by_job_id(db=self.db, job_id=job_id)
        steps_by_name = {step.step_name: step for step in steps}

        for step_name in ORDERED_PROCESSING_STEPS:
            step = steps_by_name.get(step_name.value)
            if step is None:
                raise RuntimeError(
                    f"Required processing step {step_name.value} "
                    f"is missing for job {job_id}"
                )
            if step.status != ProcessingStepStatus.COMPLETED.value:
                raise RuntimeError(
                    f"Required processing step {step_name.value} "
                    f"is not completed. Current status: {step.status}"
                )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Process an evidence processing job")
    parser.add_argument(
        "job_id",
        type=UUID,
        help="ProcessingJob UUID to process",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    EvidenceWorker().start(args.job_id)


if __name__ == "__main__":
    main()
