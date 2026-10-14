from collections.abc import Mapping

from app.core.exceptions import UnsupportedEvidenceExtractorError
from app.services.evidence_processing.extractors.base import (
    EvidenceExtractor,
)


class EvidenceExtractorFactory:
    """Resolve an extractor for a validated evidence format."""

    def __init__(
        self,
        extractors: Mapping[str, EvidenceExtractor] | None = None,
    ) -> None:
        self._extractors = dict(extractors or {})

    def get_extractor(self, file_type: str) -> EvidenceExtractor:
        """Return the extractor registered for the requested format."""

        normalized_file_type = file_type.lower().lstrip(".")

        try:
            return self._extractors[normalized_file_type]
        except KeyError as exc:
            raise UnsupportedEvidenceExtractorError(
                f"No extractor registered for file type: {normalized_file_type}"
            ) from exc
