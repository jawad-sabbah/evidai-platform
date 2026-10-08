import logging
import time
from collections.abc import Callable
from uuid import UUID

from redis.exceptions import ConnectionError, TimeoutError

from app.queue.processing_queue import ProcessingQueue

logger = logging.getLogger(__name__)


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

        logger.info("Worker waiting for processing jobs...")

        while self.running:
            try:
                job_id = self.processing_queue.dequeue(
                    timeout=5,
                )

            except (ConnectionError, TimeoutError) as exc:
                logger.error(
                    "Redis unavailable: %s. Retrying in 5 seconds...",
                    exc,
                )
                time.sleep(5)
                continue

            if job_id is None:
                continue

            self.job_handler(job_id)

    def stop(self) -> None:
        self.running = False
