import argparse
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ProcessingJobNotFoundError
from app.db.session import SessionLocal
from app.repositories.processing_job_repository import processing_job_repository


class EvidenceWorker:
    def __init__(self) -> None:
        self.db: Session | None = None

    def start(self, job_id: UUID) -> None:
        print(f"Evidence worker starting for job {job_id}")

        self.db = SessionLocal()

        try:
            processing_job = processing_job_repository.get_by_id(
                db=self.db,
                job_id=job_id,
            )

            if processing_job is None:
                raise ProcessingJobNotFoundError(f"Processing job {job_id} not found")

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
