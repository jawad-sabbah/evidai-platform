from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.evidence import Evidence


class EvidenceRepository:
    def get_by_id(
        self,
        db: Session,
        evidence_id: UUID,
    ) -> Evidence | None:
        return db.get(Evidence, evidence_id)

    def list_by_case_id(
        self,
        db: Session,
        case_id: UUID,
        limit: int = 50,
        offset: int = 0,
        processing_status: str | None = None,
    ) -> list[Evidence]:
        statement = select(Evidence).where(Evidence.case_id == case_id)

        if processing_status is not None:
            statement = statement.where(Evidence.processing_status == processing_status)

        statement = (
            statement.order_by(Evidence.created_at.desc()).offset(offset).limit(limit)
        )

        return list(db.scalars(statement).all())

    def get_by_id_and_case_id(
        self,
        db: Session,
        evidence_id: UUID,
        case_id: UUID,
    ) -> Evidence | None:
        statement = select(Evidence).where(
            Evidence.id == evidence_id,
            Evidence.case_id == case_id,
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        evidence: Evidence,
    ) -> Evidence:
        db.add(evidence)
        db.flush()

        return evidence

    ## worker can later change processing_status by using update()
    def update(
        self,
        db: Session,
        evidence: Evidence,
    ) -> Evidence:
        db.flush()
        db.refresh(evidence)

        return evidence


evidence_repository = EvidenceRepository()
