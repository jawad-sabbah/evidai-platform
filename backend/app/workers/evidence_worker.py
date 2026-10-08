import argparse
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enums import (
    ProcessingJobStatus,
    ProcessingStepName,
)
from app.core.exceptions import (
    InvalidProcessingJobStatusError,
    ProcessingJobNotFoundError,
)
from app.db.session import SessionLocal
from app.processing.pipeline import ProcessingPipeline
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

            # check if exist job found
            if processing_job is None:
                raise ProcessingJobNotFoundError(f"Processing job {job_id} not found")

            # Ignore jobs already being processed by another worker
            if processing_job.status == ProcessingJobStatus.RUNNING.value:
                print(f"Processing job {job_id} is already RUNNING. Skipping.")
                return

            # Ignore jobs that have already completed
            if processing_job.status == ProcessingJobStatus.COMPLETED.value:
                print(f"Processing job {job_id} is already COMPLETED. Skipping.")
                return

            # check if status is QUEUED
            if processing_job.status != ProcessingJobStatus.QUEUED.value:
                raise InvalidProcessingJobStatusError(
                    f"Processing job {job_id} is not queued"
                )

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

            # execute processing pipeline
            pipeline = ProcessingPipeline(
                db=self.db,
            )

            try:
                pipeline.execute(
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

    def initialize_processing_steps(
        self,
        job_id: UUID,
    ) -> None:
        if self.db is None:
            raise RuntimeError("Worker database session is not initialized")

        step_names = (
            ProcessingStepName.LOAD_FILE,
            ProcessingStepName.EXTRACT_CONTENT,
            ProcessingStepName.NORMALIZE_CONTENT,
            ProcessingStepName.STORE_RESULT,
        )

        for step_name in step_names:
            processing_step_repository.get_by_job_and_name(
                db=self.db, job_id=job_id, step_name=step_name.value
            )

        self.db.commit()


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
