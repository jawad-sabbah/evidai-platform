from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO
from uuid import UUID


@dataclass(frozen=True)
class EvidenceFileDescriptor:
    """Represents a stored evidence file ready for processing."""

    evidence_id: UUID
    case_id: UUID
    path: Path
    original_filename: str
    file_type: str
    mime_type: str | None
    file_size: int | None
    checksum: str | None

    def open(self) -> BinaryIO:
        """Open the original evidence file in binary read-only mode."""
        return self.path.open("rb")
