from collections.abc import Iterator
from contextlib import contextmanager
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.file_loader import (
    EvidenceFileLoader,
    evidence_file_loader,
)
from app.services.evidence_processing.file_snapshot_service import (
    EvidenceFileSnapshotService,
    evidence_file_snapshot_service,
)
from app.services.evidence_processing.validators.file_integrity_validator import (
    EvidenceFileIntegrityValidator,
    evidence_file_integrity_validator,
)
from app.services.evidence_processing.validators.file_type_validator import (
    EvidenceFileTypeValidator,
    evidence_file_type_validator,
)


class EvidenceFileValidationService:
    """Coordinate secure evidence loading and validation."""

    def __init__(
        self,
        file_loader: EvidenceFileLoader | None = None,
        integrity_validator: EvidenceFileIntegrityValidator | None = None,
        type_validator: EvidenceFileTypeValidator | None = None,
        snapshot_service: EvidenceFileSnapshotService | None = None,
    ) -> None:
        self.file_loader = (
            file_loader if file_loader is not None else evidence_file_loader
        )
        self.integrity_validator = (
            integrity_validator
            if integrity_validator is not None
            else evidence_file_integrity_validator
        )
        self.type_validator = (
            type_validator
            if type_validator is not None
            else evidence_file_type_validator
        )
        self.snapshot_service = (
            snapshot_service
            if snapshot_service is not None
            else evidence_file_snapshot_service
        )

    def validate(
        self,
        db: Session,
        job_id: UUID,
    ) -> ValidatedEvidenceFile:
        """Load, verify and validate an evidence file."""

        # 1. Resolve the original stored evidence.
        descriptor = self.file_loader.load(
            db=db,
            job_id=job_id,
        )

        # 2. Verify size and SHA-256 before parsing file formats.
        integrity_result = self.integrity_validator.validate(
            descriptor=descriptor,
        )

        # 3. Verify that the file format is supported.
        detected_file_type = self.type_validator.validate(
            descriptor=descriptor,
        )

        # 4. Return a structured validation result.
        return ValidatedEvidenceFile(
            descriptor=descriptor,
            detected_file_type=detected_file_type,
            verified_size=integrity_result.file_size,
            verified_checksum=integrity_result.checksum,
        )

    @contextmanager
    def open_validated(
        self,
        db: Session,
        job_id: UUID,
    ) -> Iterator[ValidatedEvidenceFile]:
        """Provide a verified snapshot for downstream processing."""

        original_descriptor = self.file_loader.load(
            db=db,
            job_id=job_id,
        )

        with self.snapshot_service.open_snapshot(
            original_descriptor
        ) as snapshot_descriptor:
            integrity_result = self.integrity_validator.validate(
                descriptor=snapshot_descriptor,
            )

            detected_file_type = self.type_validator.validate(
                descriptor=snapshot_descriptor,
            )

            yield ValidatedEvidenceFile(
                descriptor=snapshot_descriptor,
                detected_file_type=detected_file_type,
                verified_size=integrity_result.file_size,
                verified_checksum=integrity_result.checksum,
            )


evidence_file_validation_service = EvidenceFileValidationService()
