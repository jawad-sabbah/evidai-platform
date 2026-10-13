from dataclasses import dataclass

from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)


@dataclass(frozen=True)
class ValidatedEvidenceFile:
    """Evidence file metadata after successful validation."""

    descriptor: EvidenceFileDescriptor
    detected_file_type: str
    verified_size: int
    verified_checksum: str
