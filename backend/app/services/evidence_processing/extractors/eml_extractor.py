from email import policy
from email.parser import BytesParser

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


class EmlExtractor(EvidenceExtractor):
    """Extract email headers and plain-text message bodies."""

    EXTRACTOR_NAME = "EmlExtractor"

    def __init__(
        self,
        max_file_bytes: int = 10 * 1024 * 1024,
        max_mime_parts: int = 100,
        max_extracted_characters: int = 2_000_000,
    ) -> None:
        if (
            min(
                max_file_bytes,
                max_mime_parts,
                max_extracted_characters,
            )
            <= 0
        ):
            raise ValueError("Email extraction limits must be positive")

        self._max_file_bytes = max_file_bytes
        self._max_mime_parts = max_mime_parts
        self._max_extracted_characters = max_extracted_characters

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        if evidence_file.detected_file_type.lower() != "eml":
            raise MessageExtractionError(
                "Email extractor requires an EML evidence file"
            )

        descriptor = evidence_file.descriptor

        try:
            with descriptor.open() as source:
                content = source.read(self._max_file_bytes + 1)

            if len(content) > self._max_file_bytes:
                raise MessageExtractionLimitError("Email exceeds the input size limit")

            message = BytesParser(policy=policy.default).parsebytes(content)

            if message.defects:
                raise MessageExtractionError("Email contains malformed MIME structure")

            headers = {
                "message_id": str(message.get("Message-ID", "")),
                "sender": str(message.get("From", "")),
                "recipients": str(message.get("To", "")),
                "cc": str(message.get("Cc", "")),
                "subject": str(message.get("Subject", "")),
                "date": str(message.get("Date", "")),
            }

            parts = list(message.walk())

            if len(parts) > self._max_mime_parts:
                raise MessageExtractionLimitError("Email exceeds the MIME part limit")

            blocks = []
            total_characters = 0
            attachment_count = 0

            for part in parts:
                if part.is_multipart():
                    continue

                disposition = part.get_content_disposition()

                if disposition == "attachment" or part.get_filename():
                    attachment_count += 1
                    continue

                if part.get_content_type() != "text/plain":
                    continue

                if part.defects:
                    raise MessageExtractionError("Email contains a malformed text part")

                text = part.get_content()

                if not isinstance(text, str):
                    raise MessageExtractionError("Unable to decode email text")

                total_characters += len(text)

                if total_characters > self._max_extracted_characters:
                    raise MessageExtractionLimitError(
                        "Email body exceeds the character limit"
                    )

                blocks.append(
                    ExtractedContentBlock(
                        text=text,
                        content_type="email_body",
                        source_reference=SourceReference(
                            message_id=headers["message_id"] or None
                        ),
                        metadata={
                            "mime_type": "text/plain",
                            "part_number": len(blocks) + 1,
                        },
                    )
                )

        except MessageExtractionError:
            raise
        except (
            OSError,
            UnicodeError,
            ValueError,
            LookupError,
            TypeError,
        ) as exc:
            raise MessageExtractionError("Unable to extract email evidence") from exc

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="eml",
            extractor_name=self.EXTRACTOR_NAME,
            blocks=tuple(blocks),
            metadata={
                **headers,
                "body_part_count": len(blocks),
                "attachment_count": attachment_count,
                "extracted_character_count": total_characters,
            },
        )
