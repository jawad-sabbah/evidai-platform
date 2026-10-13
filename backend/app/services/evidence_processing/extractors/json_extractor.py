import json

from app.core.exceptions import TextExtractionError
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


class JsonExtractor(EvidenceExtractor):
    """Extract parsed JSON while preserving its structured values."""

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        text = read_evidence_text(evidence_file, expected_type="json")

        try:
            structured_data = json.loads(text)
        except (ValueError, RecursionError) as exc:
            raise TextExtractionError("Unable to parse JSON evidence") from exc

        descriptor = evidence_file.descriptor

        block = ExtractedContentBlock(
            text=text,
            content_type="json_document",
            source_reference=SourceReference(),
            metadata={
                "structured_data": structured_data,
            },
        )

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="json",
            extractor_name="JsonExtractor",
            blocks=(block,),
            metadata={
                "encoding": "utf-8",
                "root_type": type(structured_data).__name__,
            },
        )
