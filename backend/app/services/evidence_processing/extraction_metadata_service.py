import math
from dataclasses import replace
from datetime import datetime, timezone

from app.core.exceptions import ExtractionMetadataError
from app.services.evidence_processing.dto.extraction_provenance import (
    ExtractionProvenance,
)
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)


class ExtractionMetadataService:
    """Validate and enrich extraction results with verified provenance."""

    def enrich(
        self,
        evidence_file: ValidatedEvidenceFile,
        result: ExtractionResult,
    ) -> ExtractionResult:
        """Return a new extraction result with validated source metadata."""

        self._validate_identity(evidence_file, result)

        if result.provenance is not None:
            raise ExtractionMetadataError(
                "Extraction result already contains provenance"
            )

        if not result.extractor_name.strip():
            raise ExtractionMetadataError("Extractor name must not be empty")

        enriched_blocks = tuple(
            self._enrich_block(block, block_number)
            for block_number, block in enumerate(
                result.blocks,
                start=1,
            )
        )

        provenance = ExtractionProvenance(
            source_checksum_sha256=evidence_file.verified_checksum,
            source_size_bytes=evidence_file.verified_size,
            extractor_name=result.extractor_name,
            extracted_at=datetime.now(timezone.utc),
        )

        return replace(
            result,
            blocks=enriched_blocks,
            provenance=provenance,
        )

    @staticmethod
    def _validate_identity(
        evidence_file: ValidatedEvidenceFile,
        result: ExtractionResult,
    ) -> None:
        """Ensure the extracted result belongs to the validated file."""

        descriptor = evidence_file.descriptor

        if result.evidence_id != descriptor.evidence_id:
            raise ExtractionMetadataError(
                "Extraction evidence ID does not match the source"
            )

        if result.case_id != descriptor.case_id:
            raise ExtractionMetadataError(
                "Extraction case ID does not match the source"
            )

        if result.file_type.lower().lstrip(
            "."
        ) != evidence_file.detected_file_type.lower().lstrip("."):
            raise ExtractionMetadataError(
                "Extraction file type does not match the source"
            )

        if evidence_file.verified_size < 0 or not evidence_file.verified_checksum:
            raise ExtractionMetadataError(
                "Validated evidence integrity metadata is incomplete"
            )

        if descriptor.file_size != evidence_file.verified_size or (
            descriptor.checksum is not None
            and descriptor.checksum.lower() != evidence_file.verified_checksum.lower()
        ):
            raise ExtractionMetadataError("Validated source metadata is inconsistent")

    @classmethod
    def _enrich_block(
        cls,
        block: ExtractedContentBlock,
        block_number: int,
    ) -> ExtractedContentBlock:
        """Assign extraction position without losing source references."""

        if not isinstance(block.text, str):
            raise ExtractionMetadataError("Extracted block text must be a string")

        if not block.content_type.strip():
            raise ExtractionMetadataError(
                "Extracted block content type must not be empty"
            )

        source_reference = block.source_reference

        cls._validate_source_reference(source_reference)

        if source_reference.block_number is not None:
            raise ExtractionMetadataError(
                "Block position must be assigned by the metadata service"
            )

        return replace(
            block,
            source_reference=replace(
                source_reference,
                block_number=block_number,
            ),
        )

    @staticmethod
    def _validate_source_reference(
        reference: SourceReference,
    ) -> None:
        """Check that source locations are internally consistent."""

        for value in (
            reference.page_number,
            reference.row_number,
        ):
            if value is not None and (
                not isinstance(value, int) or isinstance(value, bool) or value <= 0
            ):
                raise ExtractionMetadataError(
                    "Page and row numbers must be positive integers"
                )

        if (
            reference.cell_reference is not None
            and not reference.cell_reference.strip()
        ):
            raise ExtractionMetadataError("Cell reference must not be empty")

        if reference.message_id is not None and not reference.message_id.strip():
            raise ExtractionMetadataError("Message ID must not be empty")

        start = reference.start_time_seconds
        end = reference.end_time_seconds

        if (start is None) != (end is None):
            raise ExtractionMetadataError(
                "Start and end timestamps must be provided together"
            )

        if (
            start is not None
            and end is not None
            and (
                not math.isfinite(start)
                or not math.isfinite(end)
                or start < 0
                or end < start
            )
        ):
            raise ExtractionMetadataError("Source timestamps are invalid")
