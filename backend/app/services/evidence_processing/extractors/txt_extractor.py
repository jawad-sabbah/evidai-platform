from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.base import EvidenceExtractor
from app.services.evidence_processing.extractors.text_support import (
    read_evidence_text,
)


class TxtExtractor(EvidenceExtractor):
    """Extract line-attributed content from plain-text evidence."""

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        text = read_evidence_text(evidence_file, expected_type="txt")
        lines = text.splitlines(keepends=True)

        blocks = tuple(
            ExtractedContentBlock(
                text=line,
                content_type="text_line",
                source_reference=SourceReference(),
                metadata={"line_number": line_number},
            )
            for line_number, line in enumerate(lines, start=1)
        )

        descriptor = evidence_file.descriptor

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="txt",
            extractor_name="TxtExtractor",
            blocks=blocks,
            metadata={
                "line_count": len(lines),
                "encoding": "utf-8",
            },
        )
