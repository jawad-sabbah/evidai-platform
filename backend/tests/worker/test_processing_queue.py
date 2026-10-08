from unittest.mock import Mock
from uuid import uuid4

import pytest
from redis.exceptions import ConnectionError

from app.queue.processing_queue import ProcessingQueue


def test_enqueue_job_id():
    redis_client = Mock()
    queue = ProcessingQueue(redis_client=redis_client)

    job_id = uuid4()

    queue.enqueue(job_id)

    redis_client.rpush.assert_called_once_with(
        ProcessingQueue.QUEUE_NAME,
        str(job_id),
    )


def test_dequeue_job_id():
    redis_client = Mock()
    queue = ProcessingQueue(redis_client=redis_client)

    job_id = uuid4()

    redis_client.blpop.return_value = (
        ProcessingQueue.QUEUE_NAME,
        str(job_id),
    )

    result = queue.dequeue(timeout=5)

    assert result == job_id

    redis_client.blpop.assert_called_once_with(
        ProcessingQueue.QUEUE_NAME,
        timeout=5,
    )


def test_dequeue_empty_queue():
    redis_client = Mock()
    redis_client.blpop.return_value = None

    queue = ProcessingQueue(redis_client=redis_client)

    result = queue.dequeue(timeout=5)

    assert result is None


def test_enqueue_redis_connection_failure():
    redis_client = Mock()
    redis_client.rpush.side_effect = ConnectionError("Redis unavailable")

    queue = ProcessingQueue(redis_client=redis_client)

    with pytest.raises(ConnectionError):
        queue.enqueue(uuid4())


def test_dequeue_redis_connection_failure():
    redis_client = Mock()
    redis_client.blpop.side_effect = ConnectionError("Redis unavailable")

    queue = ProcessingQueue(redis_client=redis_client)

    with pytest.raises(ConnectionError):
        queue.dequeue(timeout=5)
