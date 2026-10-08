from uuid import UUID

from redis import Redis

from app.queue.connection import get_redis_client


class ProcessingQueue:
    QUEUE_NAME = "evidai:processing:jobs"

    def __init__(
        self,
        redis_client: Redis | None = None,
    ) -> None:
        self.redis = redis_client if redis_client is not None else get_redis_client()

    # Rpush add the jobID to redis queue , the jobID recived from the evidence service after evidence upload
    def enqueue(
        self,
        job_id: UUID,
    ) -> None:
        self.redis.rpush(
            self.QUEUE_NAME,
            str(job_id),
        )

    def dequeue(
        self,
        timeout: int = 5,
    ) -> UUID | None:
        result = self.redis.blpop(
            self.QUEUE_NAME,
            timeout=timeout,
        )

        if result is None:
            return None

        _, job_id = result

        return UUID(job_id)
