from pathlib import Path
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import (
    EvidenceFileNotFoundError,
    EvidenceNotFoundError,
    InvalidEvidenceStoragePathError,
    ProcessingJobNotFoundError,
)
from app.repositories.evidence_repository import evidence_repository
from app.repositories.processing_job_repository import processing_job_repository
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.storage_service import (
    LocalStorageService,
    local_storage_service,
)


class EvidenceFileLoader:
    """Resolve stored evidence files for background processing."""

    def __init__(
        self,
        storage_service: LocalStorageService | None = None,
    ) -> None:
        self.storage_service = storage_service or local_storage_service

    def load(
        self,
        db: Session,
        job_id: UUID,
    ) -> EvidenceFileDescriptor:
        """Resolve a processing job to its original stored evidence file."""

        job = processing_job_repository.get_fresh_by_id(
            db=db,
            job_id=job_id,
        )

        if job is None:
            raise ProcessingJobNotFoundError("Processing job not found")

        evidence = evidence_repository.get_by_id_and_case_id(
            db=db,
            evidence_id=job.evidence_id,
            case_id=job.case_id,
        )

        if evidence is None:
            raise EvidenceNotFoundError(
                "Evidence associated with processing job not found"
            )

        # Original uploaded files must remain inside their case directory.
        case_directory = (self.storage_service.base_dir / str(job.case_id)).resolve()

        storage_path = Path(evidence.storage_key).resolve()

        if not storage_path.is_relative_to(case_directory):
            raise InvalidEvidenceStoragePathError(
                "Evidence storage path is outside its permitted directory"
            )

        try:
            if not storage_path.is_file():
                raise EvidenceFileNotFoundError(
                    "Original evidence file is missing or not a regular file"
                )
        except OSError as exc:
            raise EvidenceFileNotFoundError(
                "Original evidence file is not accessible"
            ) from exc

        if not storage_path.is_relative_to(case_directory):
            raise InvalidEvidenceStoragePathError(
                "Evidence storage path is outside its permitted directory"
            )

        try:
            if not storage_path.is_file():
                raise EvidenceFileNotFoundError(
                    "Original evidence file is not a regular file"
                )
        except OSError as exc:
            raise EvidenceFileNotFoundError(
                "Original evidence file is not accessible"
            ) from exc

        return EvidenceFileDescriptor(
            evidence_id=evidence.id,
            case_id=evidence.case_id,
            path=storage_path,
            original_filename=evidence.original_filename,
            file_type=evidence.file_type,
            mime_type=evidence.mime_type,
            file_size=evidence.file_size,
            checksum=evidence.checksum,
        )


evidence_file_loader = EvidenceFileLoader()
