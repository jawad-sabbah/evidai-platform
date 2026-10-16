from collections.abc import Mapping

from app.services.evidence_processing.normalization.base import (
    ContentNormalizer,
)
from app.services.evidence_processing.normalization.exceptions import (
    UnsupportedContentNormalizerError,
)


class ContentNormalizerFactory:
    """Resolve registered normalizers by extracted content type."""

    def __init__(
        self,
        normalizers: Mapping[str, ContentNormalizer],
    ) -> None:
        self._normalizers = dict(normalizers)

    def get_normalizer(
        self,
        content_type: str,
    ) -> ContentNormalizer:
        """Return the normalizer registered for the content type."""
        try:
            return self._normalizers[content_type]
        except KeyError as exc:
            raise UnsupportedContentNormalizerError(content_type) from exc
