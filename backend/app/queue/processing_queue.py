from redis import Redis

from app.queue.connection import get_redis_client


class ProcessingQueue:
    QUEUE_NAME = "evidai:processing:jobs"

    def __init__(
        self,
        redis_client: Redis | None = None,
    ) -> None:
        self.redis = redis_client if redis_client is not None else get_redis_client()
