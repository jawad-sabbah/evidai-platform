from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.processing_step import ProcessingStep


class ProcessingStepRepository:
    def get_by_job_and_name(
        self,
        db: Session,
        job_id: UUID,
        step_name: str,
    ) -> ProcessingStep | None:
        statement = select(ProcessingStep).where(
            ProcessingStep.job_id == job_id,
            ProcessingStep.step_name == step_name,
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        processing_step: ProcessingStep,
    ) -> ProcessingStep:
        db.add(processing_step)
        db.flush()

        return processing_step

    def get_or_create(
        self,
        db: Session,
        job_id: UUID,
        step_name: str,
    ) -> ProcessingStep:
        processing_step = self.get_by_job_and_name(
            db=db,
            job_id=job_id,
            step_name=step_name,
        )

        if processing_step is not None:
            return processing_step

        processing_step = ProcessingStep(
            job_id=job_id,
            step_name=step_name,
        )

        return self.create(
            db=db,
            processing_step=processing_step,
        )

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
