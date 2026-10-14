from defusedxml import ElementTree
from defusedxml.common import DefusedXmlException

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


class XmlExtractor(EvidenceExtractor):
    """Extract safely parsed XML with its source structure."""

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        text = read_evidence_text(evidence_file, expected_type="xml")

        try:
            root = ElementTree.fromstring(text)
        except (
            ElementTree.ParseError,
            DefusedXmlException,
            RecursionError,
        ) as exc:
            raise TextExtractionError("Unable to parse XML evidence") from exc

        descriptor = evidence_file.descriptor

        block = ExtractedContentBlock(
            text=text,
            content_type="xml_document",
            source_reference=SourceReference(),
            metadata={
                "root_tag": root.tag,
                "root_attributes": dict(root.attrib),
                "element_count": sum(1 for _ in root.iter()),
            },
        )

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="xml",
            extractor_name="XmlExtractor",
            blocks=(block,),
            metadata={
                "encoding": "utf-8",
                "root_tag": root.tag,
            },
        )
