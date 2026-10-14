import json
from datetime import datetime

from app.core.exceptions import (
    MessageExtractionError,
    MessageExtractionLimitError,
)
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.base import EvidenceExtractor


class ChatJsonExtractor(EvidenceExtractor):
    """Extract message-level evidence from the EvidAI chat JSON schema."""

    EXTRACTOR_NAME = "ChatJsonExtractor"

    def __init__(
        self,
        max_file_bytes: int = 8 * 1024 * 1024,
        max_messages: int = 10_000,
        max_extracted_characters: int = 2_000_000,
    ) -> None:
        if (
            min(
                max_file_bytes,
                max_messages,
                max_extracted_characters,
            )
            <= 0
        ):
            raise ValueError("Chat extraction limits must be positive")

        self._max_file_bytes = max_file_bytes
        self._max_messages = max_messages
        self._max_extracted_characters = max_extracted_characters

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        if evidence_file.detected_file_type.lower() != "json":
            raise MessageExtractionError("Chat extractor requires JSON evidence")

        descriptor = evidence_file.descriptor

        try:
            with descriptor.open() as source:
                raw_content = source.read(self._max_file_bytes + 1)

            if len(raw_content) > self._max_file_bytes:
                raise MessageExtractionLimitError(
                    "Chat export exceeds the input size limit"
                )

            document = json.loads(
                raw_content.decode("utf-8-sig"),
                parse_constant=self._reject_nonfinite_number,
                object_pairs_hook=self._unique_object,
            )

        except MessageExtractionError:
            raise
        except (
            OSError,
            UnicodeError,
            ValueError,
            RecursionError,
        ) as exc:
            raise MessageExtractionError("Unable to parse chat export") from exc

        if not isinstance(document, dict):
            raise MessageExtractionError("Chat export must contain a JSON object")

        messages = document.get("messages")

        if not isinstance(messages, list):
            raise MessageExtractionError("Chat export must contain a messages array")

        if len(messages) > self._max_messages:
            raise MessageExtractionLimitError("Chat export exceeds the message limit")

        blocks = []
        seen_ids = set()
        total_characters = 0

        for index, message in enumerate(messages, start=1):
            if not isinstance(message, dict):
                raise MessageExtractionError(f"Message {index} must be an object")

            required_fields = ("id", "sender", "timestamp", "text")

            if any(
                not isinstance(message.get(field), str) for field in required_fields
            ):
                raise MessageExtractionError(
                    f"Message {index} has invalid required fields"
                )

            message_id = message["id"]
            sender = message["sender"]
            timestamp = message["timestamp"]
            text = message["text"]

            if not message_id or not sender or not timestamp:
                raise MessageExtractionError(
                    f"Message {index} has empty identity fields"
                )

            if message_id in seen_ids:
                raise MessageExtractionError(f"Duplicate message ID: {message_id}")

            seen_ids.add(message_id)

            try:
                parsed_timestamp = datetime.fromisoformat(
                    timestamp.replace("Z", "+00:00")
                )
            except ValueError as exc:
                raise MessageExtractionError(
                    f"Message {index} has an invalid timestamp"
                ) from exc

            if parsed_timestamp.tzinfo is None:
                raise MessageExtractionError(f"Message {index} must have a timezone")

            total_characters += len(text)

            if total_characters > self._max_extracted_characters:
                raise MessageExtractionLimitError(
                    "Chat text exceeds the character limit"
                )

            blocks.append(
                ExtractedContentBlock(
                    text=text,
                    content_type="chat_message",
                    source_reference=SourceReference(message_id=message_id),
                    metadata={
                        "sender": sender,
                        "timestamp": timestamp,
                        "message_number": index,
                    },
                )
            )

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="json",
            extractor_name=self.EXTRACTOR_NAME,
            blocks=tuple(blocks),
            metadata={
                "export_type": "evidai_chat_json",
                "message_count": len(blocks),
                "extracted_character_count": total_characters,
            },
        )

    @staticmethod
    def _reject_nonfinite_number(value: str) -> None:
        raise MessageExtractionError(
            f"Non-finite JSON number is not supported: {value}"
        )

    @staticmethod
    def _unique_object(pairs: list[tuple[str, object]]) -> dict:
        result = {}

        for key, value in pairs:
            if key in result:
                raise MessageExtractionError(f"Duplicate JSON property: {key}")
            result[key] = value

        return result
