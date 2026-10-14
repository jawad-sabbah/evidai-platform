from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from app.services.evidence_processing.dto.extraction_provenance import (
    ExtractionProvenance,
)


@dataclass(frozen=True)
class SourceReference:
    """Identify where extracted content came from."""

    page_number: int | None = None
    sheet_name: str | None = None
    row_number: int | None = None
    cell_reference: str | None = None
    message_id: str | None = None
    start_time_seconds: float | None = None
    end_time_seconds: float | None = None

    # Position in the extraction result, not the original document.
    block_number: int | None = None


@dataclass(frozen=True)
class ExtractedContentBlock:
    """A source-attributed unit of extracted content."""

    text: str
    content_type: str
    source_reference: SourceReference
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ExtractionResult:
    """Complete structured output produced by an evidence extractor."""

    evidence_id: UUID
    case_id: UUID
    file_type: str
    extractor_name: str
    blocks: tuple[ExtractedContentBlock, ...]
    metadata: dict[str, Any] = field(default_factory=dict)
    provenance: ExtractionProvenance | None = None
