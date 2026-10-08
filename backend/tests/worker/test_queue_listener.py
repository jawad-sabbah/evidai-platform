from unittest.mock import Mock
from uuid import uuid4

from redis.exceptions import ConnectionError

from app.queue.queue_listener import QueueListener


def test_listener_dispatches_job():
    processing_queue = Mock()
    job_handler = Mock()

    job_id = uuid4()

    processing_queue.dequeue.return_value = job_id

    listener = QueueListener(
        processing_queue=processing_queue,
        job_handler=job_handler,
    )

    def handle_job(received_job_id):
        job_handler(received_job_id)
        listener.stop()

    listener.job_handler = handle_job

    listener.start()

    job_handler.assert_called_once_with(job_id)


def test_listener_waits_when_queue_empty():
    processing_queue = Mock()
    job_handler = Mock()

    listener = QueueListener(
        processing_queue=processing_queue,
        job_handler=job_handler,
    )

    def dequeue_once(timeout):
        listener.stop()

    processing_queue.dequeue.side_effect = dequeue_once

    listener.start()

    job_handler.assert_not_called()
    processing_queue.dequeue.assert_called_once_with(
        timeout=5,
    )


def test_listener_retries_after_redis_failure(monkeypatch):
    processing_queue = Mock()
    job_handler = Mock()

    job_id = uuid4()

    processing_queue.dequeue.side_effect = [
        ConnectionError("Redis unavailable"),
        job_id,
    ]

    listener = QueueListener(
        processing_queue=processing_queue,
        job_handler=job_handler,
    )

    monkeypatch.setattr(
        "app.queue.queue_listener.time.sleep",
        lambda seconds: None,
    )

    def handle_job(received_job_id):
        job_handler(received_job_id)
        listener.stop()

    listener.job_handler = handle_job

    listener.start()

    assert processing_queue.dequeue.call_count == 2
    job_handler.assert_called_once_with(job_id)
