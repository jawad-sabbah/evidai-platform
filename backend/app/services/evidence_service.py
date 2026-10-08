from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.enums import EvidenceProcessingStatus
from app.core.exceptions import (
    EvidenceNotFoundError,
    EvidenceProcessingError,
    EvidenceUploadError,
)
from app.models.evidence import Evidence
from app.models.processing_job import ProcessingJob
from app.queue.processing_queue import ProcessingQueue
from app.repositories.evidence_repository import evidence_repository
from app.repositories.processing_job_repository import processing_job_repository
from app.schemas.evidence import EvidenceMetadataUpdate
from app.services.storage_service import local_storage_service


class EvidenceService:
    def upload_evidence(
        self,
        db: Session,
        case_id: UUID,
        uploaded_by: UUID,
        file: UploadFile,
        display_name: str | None = None,
        source_type: str | None = None,
        description: str | None = None,
    ) -> Evidence:
        evidence_id = uuid4()

        try:
            stored_file = local_storage_service.save(
                file=file,
                case_id=case_id,
                evidence_id=evidence_id,
            )
        except OSError as exc:
            raise EvidenceUploadError("Failed to store evidence file") from exc

        evidence = Evidence(
            id=evidence_id,
            case_id=case_id,
            uploaded_by=uploaded_by,
            original_filename=file.filename or "unknown",
            display_name=display_name,
            file_type=Path(file.filename or "").suffix.lower().lstrip("."),
            mime_type=file.content_type,
            file_size=stored_file.file_size,
            storage_key=stored_file.storage_key,
            checksum=stored_file.checksum,
            source_type=source_type,
            description=description,
            processing_status=EvidenceProcessingStatus.QUEUED.value,
        )

        try:
            evidence_repository.create(
                db=db,
                evidence=evidence,
            )

            processing_job = ProcessingJob(
                case_id=case_id,
                evidence_id=evidence.id,
            )

            processing_job_repository.create(
                db=db,
                processing_job=processing_job,
            )

            db.commit()
            db.refresh(evidence)

            # Enqueue the process jobID in redis
            processing_queue = ProcessingQueue()
            processing_queue.enqueue(job_id=processing_job.id)

            return evidence

        except Exception:
            db.rollback()

            local_storage_service.delete(stored_file.storage_key)

            raise

    def get_evidence_by_id(
        self,
        db: Session,
        case_id: UUID,
        evidence_id: UUID,
    ) -> Evidence:
        evidence = evidence_repository.get_by_id_and_case_id(
            db=db,
            evidence_id=evidence_id,
            case_id=case_id,
        )

        if evidence is None:
            raise EvidenceNotFoundError("Evidence not found")

        return evidence

    def get_evidence_by_case(
        self,
        db: Session,
        case_id: UUID,
        limit: int = 50,
        offset: int = 0,
        processing_status: str | None = None,
    ) -> list[Evidence]:
        return evidence_repository.list_by_case_id(
            db=db,
            case_id=case_id,
            limit=limit,
            offset=offset,
            processing_status=processing_status,
        )

    def update_metadata(
        self,
        db: Session,
        case_id: UUID,
        evidence_id: UUID,
        payload: EvidenceMetadataUpdate,
    ) -> Evidence:
        evidence = evidence_repository.get_by_id_and_case_id(
            db=db,
            evidence_id=evidence_id,
            case_id=case_id,
        )

        if evidence is None:
            raise EvidenceNotFoundError("Evidence not found")

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(evidence, field, value)

        evidence_repository.update(
            db=db,
            evidence=evidence,
        )

        db.commit()
        db.refresh(evidence)

        return evidence

    def delete_evidence(
        self,
        db: Session,
        case_id: UUID,
        evidence_id: UUID,
    ) -> None:
        evidence = evidence_repository.get_by_id_and_case_id(
            db=db,
            evidence_id=evidence_id,
            case_id=case_id,
        )

        if evidence is None:
            raise EvidenceNotFoundError("Evidence not found")

        running_job = processing_job_repository.get_running_by_evidence_id(
            db=db,
            evidence_id=evidence.id,
        )

        if running_job is not None:
            raise EvidenceProcessingError(
                "Evidence cannot be deleted while processing is running"
            )

        try:
            local_storage_service.delete(
                evidence.storage_key,
            )

            evidence_repository.delete(
                db=db,
                evidence=evidence,
            )

            db.commit()

        except Exception:
            db.rollback()
            raise


evidence_service = EvidenceService()
