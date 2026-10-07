from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.processing_step import ProcessingStep


class ProcessingStepRepository:
    def create(
        self,
        db: Session,
        processing_step: ProcessingStep,
    ) -> ProcessingStep:
        db.add(processing_step)
        db.flush()

        return processing_step

    def list_by_job_id(
        self,
        db: Session,
        job_id: UUID,
    ) -> list[ProcessingStep]:
        statement = (
            select(ProcessingStep)
            .where(ProcessingStep.job_id == job_id)
            .order_by(ProcessingStep.created_at.asc())
        )

        return list(db.scalars(statement).all())

    def update(
        self,
        db: Session,
        processing_step: ProcessingStep,
    ) -> ProcessingStep:
        db.flush()
        db.refresh(processing_step)

        return processing_step


processing_step_repository = ProcessingStepRepository()
