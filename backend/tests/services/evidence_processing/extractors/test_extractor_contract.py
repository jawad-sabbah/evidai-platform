from uuid import uuid4

import pytest

from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.extractors.base import (
    EvidenceExtractor,
)


class FakePdfExtractor(EvidenceExtractor):
    """Minimal extractor implementation used for contract testing."""

    def extract(self, evidence_file):
        return ExtractionResult(
            evidence_id=evidence_file.descriptor.evidence_id,
            case_id=evidence_file.descriptor.case_id,
            file_type="pdf",
            extractor_name="FakePdfExtractor",
            blocks=(
                ExtractedContentBlock(
                    text="Sample evidence text",
                    content_type="paragraph",
                    source_reference=SourceReference(page_number=1),
                ),
            ),
        )


def test_abstract_extractor_cannot_be_instantiated():
    with pytest.raises(TypeError):
        EvidenceExtractor()


def test_concrete_extractor_implements_contract():
    extractor = FakePdfExtractor()

    assert isinstance(extractor, EvidenceExtractor)


def test_extraction_result_preserves_source_references():
    result = ExtractionResult(
        evidence_id=uuid4(),
        case_id=uuid4(),
        file_type="pdf",
        extractor_name="FakePdfExtractor",
        blocks=(
            ExtractedContentBlock(
                text="Important evidence",
                content_type="paragraph",
                source_reference=SourceReference(page_number=2),
            ),
        ),
    )

    assert result.blocks[0].text == "Important evidence"
    assert result.blocks[0].source_reference.page_number == 2
    assert isinstance(result.blocks, tuple)


def test_extraction_result_preserves_evidence_identity():
    evidence_id = uuid4()
    case_id = uuid4()

    result = ExtractionResult(
        evidence_id=evidence_id,
        case_id=case_id,
        file_type="txt",
        extractor_name="FakeTextExtractor",
        blocks=(),
    )

    assert result.evidence_id == evidence_id
    assert result.case_id == case_id
