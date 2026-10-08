from collections.abc import Callable
from uuid import UUID

from app.queue.processing_queue import ProcessingQueue


## QueueListener Continuously waits for job IDs
class QueueListener:
    def __init__(
        self,
        processing_queue: ProcessingQueue,
        job_handler: Callable[[UUID], None],
    ) -> None:
        self.processing_queue = processing_queue
        self.job_handler = job_handler
        self.running = False

    def start(self) -> None:
        self.running = True

        print("Worker waiting for processing jobs...")

        while self.running:
            job_id = self.processing_queue.dequeue(
                timeout=5,
            )

            if job_id is None:
                continue

            self.job_handler(job_id)

    def stop(self) -> None:
        self.running = False
