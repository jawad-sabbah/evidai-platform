import logging
from uuid import UUID

from app.queue.processing_queue import ProcessingQueue
from app.queue.queue_listener import QueueListener
from app.workers.evidence_worker import EvidenceWorker


def process_job(job_id: UUID) -> None:
    worker = EvidenceWorker()
    worker.start(job_id)


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )

    processing_queue = ProcessingQueue()

    listener = QueueListener(
        processing_queue=processing_queue,
        job_handler=process_job,
    )

    listener.start()


if __name__ == "__main__":
    main()
