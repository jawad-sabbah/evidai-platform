from abc import ABC, abstractmethod

from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
)


class ContentNormalizer(ABC):
    """Define the contract for normalizing extracted evidence content."""

    @abstractmethod
    def normalize(
        self,
        block: ExtractedContentBlock,
    ) -> ExtractedContentBlock:
        """Return a normalized copy of an extracted content block."""
