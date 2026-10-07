import argparse
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.session import SessionLocal


class EvidenceWorker:
    def __init__(self) -> None:
        self.db: Session | None = None

    def start(self, job_id: UUID) -> None:
        self.db = SessionLocal()

        try:
            print(f"Evidence worker started for job {job_id}")
        finally:
            self.db.close()
            self.db = None


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
