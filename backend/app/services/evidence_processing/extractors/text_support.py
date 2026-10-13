from app.core.exceptions import (
    TextExtractionError,
    TextExtractionLimitError,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)

MAX_TEXT_BYTES = 8 * 1024 * 1024


def read_evidence_text(
    evidence_file: ValidatedEvidenceFile,
    expected_type: str,
    max_bytes: int = MAX_TEXT_BYTES,
) -> str:
    """Read bounded UTF-8 text from a validated evidence snapshot."""

    if evidence_file.detected_file_type != expected_type:
        raise TextExtractionError(f"Expected {expected_type} evidence")

    if max_bytes <= 0:
        raise ValueError("Maximum text size must be positive")

    try:
        with evidence_file.descriptor.open() as source:
            data = source.read(max_bytes + 1)
    except OSError as exc:
        raise TextExtractionError("Unable to read evidence content") from exc

    if len(data) > max_bytes:
        raise TextExtractionLimitError("Evidence text exceeds the extraction limit")

    if b"\x00" in data:
        raise TextExtractionError("Binary content found in text evidence")

    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise TextExtractionError("Evidence text is not valid UTF-8") from exc

    if any(ord(character) < 32 and character not in "\r\n\t" for character in text):
        raise TextExtractionError("Invalid control characters in evidence text")

    return text
