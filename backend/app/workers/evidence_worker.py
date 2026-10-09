import argparse
import logging
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enums import ProcessingJobStatus, ProcessingStepStatus
from app.core.logging_config import configure_logging
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

    def start(
        self,
        job_id: UUID,
    ) -> None:
        logger.info(
            "Evidence worker starting",
            extra={"event": "worker_started"},
        )

        self.db = SessionLocal()

        try:
            processing_job = processing_job_repository.get_fresh_by_id(
                db=self.db,
                job_id=job_id,
            )

            # Ignore stale messages referencing deleted jobs
            if processing_job is None:
                logger.warning(
                    "Processing job no longer exists. Skipping stale queue message.",
                    extra={"event": "job_not_found"},
                )
                return

            # Ignore jobs that are already running
            if processing_job.status == ProcessingJobStatus.RUNNING.value:
                logger.info(
                    "Processing job is already RUNNING. Skipping.",
                    extra={"event": "job_already_running"},
                )
                return

            # Ignore jobs that have already completed
            if processing_job.status == ProcessingJobStatus.COMPLETED.value:
                logger.info(
                    "Processing job is already COMPLETED. Skipping.",
                    extra={"event": "job_already_completed"},
                )
                return

            # Ignore jobs that were cancelled or failed
            if processing_job.status in (
                ProcessingJobStatus.CANCELLED.value,
                ProcessingJobStatus.FAILED.value,
            ):
                logger.info(
                    "Processing job has status %s. Skipping stale queue message.",
                    processing_job.status,
                    extra={"event": "job_terminal_status"},
                )
                return

            # Only QUEUED jobs are eligible
            if processing_job.status != ProcessingJobStatus.QUEUED.value:
                logger.warning(
                    "Processing job has unexpected status %s. Skipping.",
                    processing_job.status,
                    extra={"event": "job_unexpected_status"},
                )
                return

            # Atomically claim the job before processing
            claimed_job = processing_job_repository.claim_job(
                db=self.db,
                job_id=job_id,
            )

            if claimed_job is None:
                logger.info(
                    "Processing job was claimed by another worker. Skipping.",
                    extra={"event": "job_claim_failed"},
                )
                return

            processing_job = claimed_job

            logger.info(
                "Processing job claimed successfully",
                extra={"event": "job_claimed"},
            )

            # Initialize processing steps
            self.initialize_processing_steps(
                processing_job.id,
            )

            # Load existing processing steps
            existing_steps = self.load_processing_steps(
                processing_job.id,
            )

            logger.info(
                "Loaded %s processing steps",
                len(existing_steps),
                extra={"event": "processing_steps_loaded"},
            )

            # Detect completed steps
            completed_steps = self.detect_completed_steps(
                existing_steps,
            )

            logger.info(
                "Detected %s completed processing steps",
                len(completed_steps),
                extra={"event": "completed_steps_detected"},
            )

            # Locate previously failed step
            failed_step = self.locate_failed_step(
                existing_steps,
            )

            if failed_step is not None:
                logger.info(
                    "Failed processing step detected: %s",
                    failed_step.step_name,
                    extra={"event": "failed_step_detected"},
                )

            # Execute processing pipeline
            pipeline = ProcessingPipeline(
                db=self.db,
            )

            try:
                logger.info(
                    "Processing pipeline starting",
                    extra={"event": "pipeline_started"},
                )

                pipeline.execute(
                    job_id=processing_job.id,
                )

                self.validate_processing_steps_completed(
                    job_id=processing_job.id,
                )

                logger.info(
                    "Processing pipeline completed successfully",
                    extra={"event": "pipeline_completed"},
                )

            except Exception:
                if processing_job.attempt_count < processing_job.max_attempts:
                    processing_job.status = ProcessingJobStatus.QUEUED.value
                    processing_job.completed_at = None

                    logger.warning(
                        "Processing job failed and is eligible for retry",
                        extra={"event": "job_retry_pending"},
                    )
                else:
                    processing_job.status = ProcessingJobStatus.FAILED.value
                    processing_job.completed_at = datetime.now(UTC)

                    logger.error(
                        "Processing job reached maximum retry attempts",
                        extra={"event": "job_max_attempts_reached"},
                    )

                processing_job_repository.update(
                    db=self.db,
                    processing_job=processing_job,
                )

                self.db.commit()
                raise

            # Mark processing job as COMPLETED
            processing_job.status = ProcessingJobStatus.COMPLETED.value
            processing_job.completed_at = datetime.now(UTC)

            processing_job_repository.update(
                db=self.db,
                processing_job=processing_job,
            )

            self.db.commit()

            logger.info(
                "Processing job completed successfully",
                extra={"event": "job_completed"},
            )

        except KeyboardInterrupt:
            self.db.rollback()

            logger.warning(
                "Evidence worker interrupted",
                extra={"event": "worker_interrupted"},
            )

        except Exception:
            self.db.rollback()

            logger.exception(
                "Evidence worker failed",
                extra={"event": "worker_failed"},
            )
            raise

        finally:
            self.db.close()
            self.db = None

            logger.info(
                "Evidence worker stopped",
                extra={"event": "worker_stopped"},
            )

    def load_processing_steps(
        self,
        job_id: UUID,
    ) -> list[ProcessingStep]:
        if self.db is None:
            raise RuntimeError("Worker database session is not initialized")

        return processing_step_repository.list_by_job_id(
            db=self.db,
            job_id=job_id,
        )

    def detect_completed_steps(
        self,
        steps: list[ProcessingStep],
    ) -> set[str]:
        return {
            step.step_name
            for step in steps
            if step.status == ProcessingStepStatus.COMPLETED.value
        }

    def locate_failed_step(
        self,
        steps: list[ProcessingStep],
    ) -> ProcessingStep | None:
        steps_by_name = {step.step_name: step for step in steps}

        for step_name in ORDERED_PROCESSING_STEPS:
            step = steps_by_name.get(step_name.value)

            if step is not None and step.status == ProcessingStepStatus.FAILED.value:
                return step

        return None

    def initialize_processing_steps(
        self,
        job_id: UUID,
    ) -> None:
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

            processing_step = ProcessingStep(
                job_id=job_id,
                step_name=step_name.value,
                status=ProcessingStepStatus.PENDING.value,
            )

            self.db.add(processing_step)

        self.db.commit()

    def validate_processing_steps_completed(
        self,
        job_id: UUID,
    ) -> None:
        if self.db is None:
            raise RuntimeError("Worker database session is not initialized")

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

            if step.status != ProcessingStepStatus.COMPLETED.value:
                raise RuntimeError(
                    f"Required processing step {step_name.value} "
                    f"is not completed. Current status: {step.status}"
                )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Process an evidence processing job",
    )

    parser.add_argument(
        "job_id",
        type=UUID,
        help="ProcessingJob UUID to process",
    )

    return parser.parse_args()


def main() -> None:
    args = parse_args()

    worker = EvidenceWorker()
    worker.start(args.job_id)


if __name__ == "__main__":
    main()
