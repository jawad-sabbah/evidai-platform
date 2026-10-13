import hashlib
import hmac
import re
from dataclasses import dataclass

from app.core.exceptions import (
    EvidenceFileIntegrityError,
    EvidenceFileNotFoundError,
    EvidenceFileSizeError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)

CHUNK_SIZE = 1024 * 1024
SHA256_PATTERN = re.compile(r"[0-9a-fA-F]{64}")


@dataclass(frozen=True)
class FileIntegrityResult:
    """The verified size and SHA-256 checksum of an evidence file."""

    file_size: int
    checksum: str


class EvidenceFileIntegrityValidator:
    """Validate evidence size and integrity using streamed file reads."""

    def __init__(self, max_size_bytes: int) -> None:
        if max_size_bytes <= 0:
            raise ValueError("Maximum file size must be positive")

        self.max_size_bytes = max_size_bytes

    def validate(
        self,
        descriptor: EvidenceFileDescriptor,
    ) -> FileIntegrityResult:
        """Verify file size and original SHA-256 checksum."""

        if descriptor.file_size is None or descriptor.file_size < 0:
            raise EvidenceFileIntegrityError(
                "Stored evidence file size is missing or invalid"
            )

        if (
            descriptor.checksum is None
            or SHA256_PATTERN.fullmatch(descriptor.checksum) is None
        ):
            raise EvidenceFileIntegrityError(
                "Stored evidence SHA-256 checksum is missing or invalid"
            )

        hasher = hashlib.sha256()
        actual_size = 0

        try:
            with descriptor.open() as file:
                while chunk := file.read(CHUNK_SIZE):
                    actual_size += len(chunk)

                    if actual_size > self.max_size_bytes:
                        raise EvidenceFileSizeError(
                            "Evidence file exceeds the maximum allowed size"
                        )

                    hasher.update(chunk)
        except (FileNotFoundError, PermissionError, IsADirectoryError) as exc:
            raise EvidenceFileNotFoundError(
                "Original evidence file is missing or inaccessible"
            ) from exc
        except OSError as exc:
            raise EvidenceFileNotFoundError(
                "Unable to read original evidence file"
            ) from exc

        if actual_size == 0:
            raise EvidenceFileSizeError("Empty evidence files cannot be processed")

        if actual_size != descriptor.file_size:
            raise EvidenceFileIntegrityError(
                "Evidence file size does not match stored metadata"
            )

        actual_checksum = hasher.hexdigest()

        if not hmac.compare_digest(
            actual_checksum,
            descriptor.checksum.lower(),
        ):
            raise EvidenceFileIntegrityError(
                "Evidence file checksum does not match stored metadata"
            )

        return FileIntegrityResult(
            file_size=actual_size,
            checksum=actual_checksum,
        )
