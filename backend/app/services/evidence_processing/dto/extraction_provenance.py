from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ExtractionProvenance:
    """Describe the verified evidence and its extraction operation."""

    source_checksum_sha256: str
    source_size_bytes: int
    extractor_name: str
    extracted_at: datetime
    schema_version: int = 1
