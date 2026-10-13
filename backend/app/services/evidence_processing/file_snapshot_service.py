import hashlib
import hmac
import os
import tempfile
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import replace
from pathlib import Path

from app.core.config import settings
from app.core.exceptions import (
    EvidenceFileIntegrityError,
    EvidenceFileNotFoundError,
    EvidenceFileSizeError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)

CHUNK_SIZE = 1024 * 1024


class EvidenceFileSnapshotService:
    """Create a verified, temporary processing copy of evidence."""

    def __init__(
        self,
        max_size_bytes: int | None = None,
    ) -> None:
        self.max_size_bytes = (
            settings.max_evidence_file_size_bytes
            if max_size_bytes is None
            else max_size_bytes
        )

        if self.max_size_bytes <= 0:
            raise ValueError("Maximum file size must be positive")

    @contextmanager
    def open_snapshot(
        self,
        descriptor: EvidenceFileDescriptor,
    ) -> Iterator[EvidenceFileDescriptor]:
        """Yield a verified temporary copy and remove it afterward."""

        if descriptor.file_size is None or descriptor.file_size < 0:
            raise EvidenceFileIntegrityError(
                "Stored evidence size is missing or invalid"
            )

        if (
            descriptor.checksum is None
            or len(descriptor.checksum) != 64
            or any(c not in "0123456789abcdefABCDEF" for c in descriptor.checksum)
        ):
            raise EvidenceFileIntegrityError(
                "Stored evidence SHA-256 checksum is invalid"
            )

        # TemporaryDirectory owns the snapshot lifetime.
        with tempfile.TemporaryDirectory(
            prefix="evidai-evidence-"
        ) as temporary_directory:
            snapshot_path = (
                Path(temporary_directory) / f"snapshot{descriptor.path.suffix}"
            )

            hasher = hashlib.sha256()
            copied_size = 0

            try:
                with (
                    descriptor.open() as source,
                    snapshot_path.open("xb") as destination,
                ):
                    while chunk := source.read(CHUNK_SIZE):
                        copied_size += len(chunk)

                        if copied_size > self.max_size_bytes:
                            raise EvidenceFileSizeError(
                                "Evidence exceeds maximum processing size"
                            )

                        destination.write(chunk)
                        hasher.update(chunk)

                    destination.flush()
                    os.fsync(destination.fileno())

            except OSError as exc:
                raise EvidenceFileNotFoundError(
                    "Unable to create evidence processing snapshot"
                ) from exc

            if copied_size == 0:
                raise EvidenceFileSizeError("Empty evidence files cannot be processed")

            if copied_size != descriptor.file_size:
                raise EvidenceFileIntegrityError("Evidence size changed since upload")

            actual_checksum = hasher.hexdigest()

            if not hmac.compare_digest(
                actual_checksum,
                descriptor.checksum.lower(),
            ):
                raise EvidenceFileIntegrityError(
                    "Evidence checksum changed since upload"
                )

            snapshot_descriptor = replace(
                descriptor,
                path=snapshot_path,
                file_size=copied_size,
                checksum=actual_checksum,
            )

            yield snapshot_descriptor


evidence_file_snapshot_service = EvidenceFileSnapshotService()
