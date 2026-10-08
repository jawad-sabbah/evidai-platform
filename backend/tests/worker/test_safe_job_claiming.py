from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import ProcessingJobStatus
from app.db.session import engine
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.processing_job import ProcessingJob
from app.repositories.processing_job_repository import (
    processing_job_repository,
)


def test_only_one_worker_claims_job():
    barrier = Barrier(2)

    case_id = uuid4()
    evidence_id = uuid4()
    job_id = uuid4()

    # Arrange: create records visible to both database connections.
    with Session(engine) as db:
        case = Case(
            id=case_id,
            case_number=f"TEST-{uuid4().hex}",
            title="Concurrent Worker Test",
            created_by=settings.dev_user_id,
        )

        db.add(case)
        db.flush()

        evidence = Evidence(
            id=evidence_id,
            case_id=case_id,
            uploaded_by=settings.dev_user_id,
            original_filename="test.pdf",
            file_type="PDF",
            storage_key=f"tests/{uuid4()}/test.pdf",
        )

        db.add(evidence)
        db.flush()

        job = ProcessingJob(
            id=job_id,
            case_id=case_id,
            evidence_id=evidence_id,
            status=ProcessingJobStatus.QUEUED.value,
            attempt_count=0,
            max_attempts=3,
        )

        db.add(job)
        db.commit()

    try:

        def attempt_claim():
            # Each worker gets its own independent session.
            with Session(engine) as db:
                barrier.wait(timeout=10)

                claimed_job = processing_job_repository.claim_job(
                    db=db,
                    job_id=job_id,
                )

                return claimed_job is not None

        # Act: two workers attempt the claim concurrently.
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = [executor.submit(attempt_claim) for _ in range(2)]

            results = [future.result(timeout=20) for future in futures]

        # Assert: only one worker claimed the job.
        assert results.count(True) == 1
        assert results.count(False) == 1

        with Session(engine) as db:
            job = processing_job_repository.get_fresh_by_id(
                db=db,
                job_id=job_id,
            )

            assert job is not None
            assert job.status == ProcessingJobStatus.RUNNING.value
            assert job.attempt_count == 1
            assert job.started_at is not None

    finally:
        # Remove test records in foreign-key dependency order.
        with Session(engine) as db:
            db.query(ProcessingJob).filter(ProcessingJob.id == job_id).delete()

            db.query(Evidence).filter(Evidence.id == evidence_id).delete()

            db.query(Case).filter(Case.id == case_id).delete()

            db.commit()
