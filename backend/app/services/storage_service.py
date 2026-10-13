import os
import tempfile
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import (
    EvidenceFileSizeError,
    EvidenceStorageConflictError,
)

CHUNK_SIZE = 1024 * 1024


@dataclass(frozen=True)
class StoredFile:
    """Information about a successfully stored evidence file."""

    storage_key: str
    file_size: int
    checksum: str


class LocalStorageService:
    """Store original evidence without overwriting existing files."""

    def __init__(
        self,
        base_dir: str = "storage/evidence",
        max_size_bytes: int | None = None,
    ) -> None:
        self.base_dir = Path(base_dir)
        self.max_size_bytes = (
            settings.max_evidence_file_size_bytes
            if max_size_bytes is None
            else max_size_bytes
        )

        if self.max_size_bytes <= 0:
            raise ValueError("Maximum evidence file size must be positive")

    def save(
        self,
        file: UploadFile,
        case_id: UUID,
        evidence_id: UUID,
    ) -> StoredFile:
        """Stream, validate and publish the original evidence safely."""

        case_dir = self.base_dir / str(case_id)
        case_dir.mkdir(parents=True, exist_ok=True)

        # The generated filename uses a trusted UUID.
        # The uploaded filename contributes only its sanitized extension.
        suffix = Path((file.filename or "").replace("\\", "/")).suffix.lower()

        if len(suffix) > 20 or (suffix and not suffix[1:].isalnum()):
            suffix = ""

        storage_path = case_dir / f"{evidence_id}{suffix}"

        hasher = sha256()
        file_size = 0
        temporary_path = None

        try:
            # The temporary file is created exclusively in the same
            # directory so publishing stays on the same filesystem.
            fd, temporary_name = tempfile.mkstemp(
                prefix=f".{evidence_id}.",
                suffix=".tmp",
                dir=case_dir,
            )
            temporary_path = Path(temporary_name)

            with os.fdopen(fd, "wb") as destination:
                while chunk := file.file.read(CHUNK_SIZE):
                    if file_size + len(chunk) > self.max_size_bytes:
                        raise EvidenceFileSizeError(
                            "Evidence file exceeds the maximum allowed size"
                        )

                    destination.write(chunk)
                    hasher.update(chunk)
                    file_size += len(chunk)

                if file_size == 0:
                    raise EvidenceFileSizeError(
                        "Empty evidence files cannot be uploaded"
                    )

                destination.flush()
                os.fsync(destination.fileno())

            # Create the final name only if it does not exist.
            # Unlike Path.replace(), os.link() cannot overwrite
            # an existing destination.
            try:
                os.link(temporary_path, storage_path)
            except FileExistsError as exc:
                raise EvidenceStorageConflictError(
                    "An evidence file already exists at this destination"
                ) from exc

            return StoredFile(
                storage_key=str(storage_path),
                file_size=file_size,
                checksum=hasher.hexdigest(),
            )

        finally:
            # Cleanup includes validation and I/O failures.
            # Never delete the existing final evidence file here.
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    def delete(self, storage_key: str) -> None:
        """Delete a stored evidence file."""

        path = Path(storage_key)

        if path.exists():
            path.unlink()


local_storage_service = LocalStorageService()
