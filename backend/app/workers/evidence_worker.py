from sqlalchemy.orm import Session

from app.db.session import SessionLocal


class EvidenceWorker:
    def __init__(self) -> None:
        self.db: Session | None = None

    def start(self) -> None:
        self.db = SessionLocal()

        try:
            print("Evidence worker started")
        finally:
            self.db.close()
            self.db = None


def main() -> None:
    worker = EvidenceWorker()
    worker.start()


if __name__ == "__main__":
    main()
