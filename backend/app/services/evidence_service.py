from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.enums import EvidenceProcessingStatus
from app.models.evidence import Evidence
from app.models.processing_job import ProcessingJob
from app.repositories.evidence_repository import evidence_repository
from app.repositories.processing_job_repository import processing_job_repository
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

        stored_file = local_storage_service.save(
            file=file,
            case_id=case_id,
            evidence_id=evidence_id,
        )

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

            return evidence

        except Exception:
            db.rollback()

            local_storage_service.delete(stored_file.storage_key)

            raise


evidence_service = EvidenceService()
