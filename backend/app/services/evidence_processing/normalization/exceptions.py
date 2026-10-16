class UnsupportedContentNormalizerError(Exception):
    """Raised when no normalizer is registered for a content type."""

    def __init__(self, content_type: str) -> None:
        super().__init__(f"No content normalizer registered for: {content_type!r}")
        self.content_type = content_type
