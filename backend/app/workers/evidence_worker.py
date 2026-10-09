import argparse
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enums import ProcessingJobStatus, ProcessingStepStatus
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


class EvidenceWorker:
    def __init__(self) -> None:
        self.db: Session | None = None

    def start(
        self,
        job_id: UUID,
    ) -> None:
        print(f"Evidence worker starting for job {job_id}")

        self.db = SessionLocal()

        try:
            processing_job = processing_job_repository.get_fresh_by_id(
                db=self.db,
                job_id=job_id,
            )

            # Ignore stale messages referencing deleted jobs
            if processing_job is None:
                print(
                    f"Processing job {job_id} no longer exists. "
                    "Skipping stale queue message."
                )
                return

            # Ignore jobs that are already running
            if processing_job.status == ProcessingJobStatus.RUNNING.value:
                print(f"Processing job {job_id} is already RUNNING. Skipping.")
                return

            # Ignore jobs that have already completed
            if processing_job.status == ProcessingJobStatus.COMPLETED.value:
                print(f"Processing job {job_id} is already COMPLETED. Skipping.")
                return

            # Ignore jobs that were cancelled or failed
            if processing_job.status in (
                ProcessingJobStatus.CANCELLED.value,
                ProcessingJobStatus.FAILED.value,
            ):
                print(
                    f"Processing job {job_id} has status "
                    f"{processing_job.status}. Skipping stale queue message."
                )
                return

            # Only QUEUED jobs are eligible
            if processing_job.status != ProcessingJobStatus.QUEUED.value:
                print(
                    f"Processing job {job_id} has unexpected status "
                    f"{processing_job.status}. Skipping."
                )
                return

            # Atomically claim the job before processing
            claimed_job = processing_job_repository.claim_job(
                db=self.db,
                job_id=job_id,
            )

            if claimed_job is None:
                print(
                    f"Processing job {job_id} was claimed by another worker. Skipping."
                )
                return

            processing_job = claimed_job

            # start processing steps
            self.initialize_processing_steps(
                processing_job.id,
            )

            # Load existing processing steps
            existing_steps = self.load_processing_steps(
                processing_job.id,
            )

            print(
                f"Loaded {len(existing_steps)} processing steps "
                f"for job {processing_job.id}"
            )

            # detect complete steps
            completed_steps = self.detect_completed_steps(
                existing_steps,
            )

            print(
                f"Detected {len(completed_steps)} completed steps "
                f"for job {processing_job.id}"
            )

            # execute processing pipeline
            pipeline = ProcessingPipeline(
                db=self.db,
            )

            try:
                pipeline.execute(
                    job_id=processing_job.id,
                )
                self.validate_processing_steps_completed(
                    job_id=processing_job.id,
                )
            except Exception:
                # retry job if maximum attempts have not been reached
                if processing_job.attempt_count < processing_job.max_attempts:
                    processing_job.status = ProcessingJobStatus.QUEUED.value
                else:
                    processing_job.status = ProcessingJobStatus.FAILED.value

                processing_job_repository.update(
                    db=self.db,
                    processing_job=processing_job,
                )

                self.db.commit()
                raise

            # mark processing job as COMPLETED
            processing_job.status = ProcessingJobStatus.COMPLETED.value
            processing_job.completed_at = datetime.now(
                UTC
            )  # add time when the job completed

            processing_job_repository.update(
                db=self.db,
                processing_job=processing_job,
            )

            self.db.commit()

            print(
                f"Processing job found: "
                f"id={processing_job.id}, "
                f"status={processing_job.status}, "
                f"evidence_id={processing_job.evidence_id}"
            )

        except KeyboardInterrupt:
            self.db.rollback()
            print("Evidence worker interrupted")

        except Exception:
            self.db.rollback()
            raise

        finally:
            self.db.close()
            self.db = None
            print("Evidence worker stopped")

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

            processing_step = ProcessingStep(
                job_id=job_id,
                step_name=step_name.value,
                status=ProcessingStepStatus.PENDING.value,
            )

            self.db.add(processing_step)

        self.db.commit()

    def validate_processing_steps_completed(self, job_id: UUID) -> None:
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
