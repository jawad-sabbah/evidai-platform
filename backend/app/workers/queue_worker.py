from uuid import UUID

from app.queue.processing_queue import ProcessingQueue
from app.queue.queue_listener import QueueListener
from app.workers.evidence_worker import EvidenceWorker


# receives the UUID from Redis and passes it to your existing worker.
def process_job(job_id: UUID) -> None:
    worker = EvidenceWorker()
    worker.start(job_id)


def main() -> None:
    processing_queue = ProcessingQueue()

    listener = QueueListener(
        processing_queue=processing_queue,
        job_handler=process_job,
    )

    listener.start()


if __name__ == "__main__":
    main()
