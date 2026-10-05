from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.processing_job import ProcessingJob


class ProcessingJobRepository:
    def get_by_id(
        self,
        db: Session,
        job_id: UUID,
    ) -> ProcessingJob | None:
        return db.get(ProcessingJob, job_id)

    def get_by_evidence_id(
        self,
        db: Session,
        evidence_id: UUID,
    ) -> ProcessingJob | None:
        statement = select(ProcessingJob).where(
            ProcessingJob.evidence_id == evidence_id
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        processing_job: ProcessingJob,
    ) -> ProcessingJob:
        db.add(processing_job)
        db.flush()

        return processing_job

    def update(
        self,
        db: Session,
        processing_job: ProcessingJob,
    ) -> ProcessingJob:
        db.flush()
        db.refresh(processing_job)

        return processing_job


processing_job_repository = ProcessingJobRepository()
