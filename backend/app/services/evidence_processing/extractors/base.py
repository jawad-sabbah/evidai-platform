from abc import ABC, abstractmethod

from app.services.evidence_processing.dto.extraction_result import (
    ExtractionResult,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)


class EvidenceExtractor(ABC):
    """Contract for all evidence content extractors."""

    @abstractmethod
    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        """Extract structured, source-attributed evidence content."""
