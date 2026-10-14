from dataclasses import replace
from pathlib import Path
from uuid import uuid4

import pytest

from app.core.exceptions import ExtractionMetadataError
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extraction_metadata_service import (
    ExtractionMetadataService,
)


@pytest.fixture
def validated_evidence(tmp_path: Path) -> ValidatedEvidenceFile:
    descriptor = EvidenceFileDescriptor(
        evidence_id=uuid4(),
        case_id=uuid4(),
        path=tmp_path / "verified.pdf",
        original_filename="verified.pdf",
        file_type="pdf",
        mime_type="application/pdf",
        file_size=100,
        checksum="a" * 64,
    )

    return ValidatedEvidenceFile(
        descriptor=descriptor,
        detected_file_type="pdf",
        verified_size=100,
        verified_checksum="a" * 64,
    )


def make_result(
    evidence_file: ValidatedEvidenceFile,
    references: tuple[SourceReference, ...] | None = None,
) -> ExtractionResult:
    if references is None:
        references = (
            SourceReference(page_number=1),
            SourceReference(page_number=2),
        )

    blocks = tuple(
        ExtractedContentBlock(
            text=f"Evidence content {index}",
            content_type="page",
            source_reference=reference,
        )
        for index, reference in enumerate(references, start=1)
    )

    return ExtractionResult(
        evidence_id=evidence_file.descriptor.evidence_id,
        case_id=evidence_file.descriptor.case_id,
        file_type="pdf",
        extractor_name="pypdf",
        blocks=blocks,
    )


def test_add_verified_provenance(validated_evidence):
    result = make_result(validated_evidence)

    enriched = ExtractionMetadataService().enrich(
        validated_evidence,
        result,
    )

    assert enriched.provenance is not None
    assert enriched.provenance.source_checksum_sha256 == "a" * 64
    assert enriched.provenance.source_size_bytes == 100
    assert enriched.provenance.extractor_name == "pypdf"
    assert enriched.provenance.schema_version == 1
    assert enriched.provenance.extracted_at.tzinfo is not None


def test_assign_sequential_block_numbers(validated_evidence):
    result = make_result(validated_evidence)

    enriched = ExtractionMetadataService().enrich(
        validated_evidence,
        result,
    )

    assert [block.source_reference.block_number for block in enriched.blocks] == [1, 2]


def test_preserve_original_page_references(validated_evidence):
    result = make_result(validated_evidence)

    enriched = ExtractionMetadataService().enrich(
        validated_evidence,
        result,
    )

    assert enriched.blocks[0].source_reference.page_number == 1
    assert enriched.blocks[1].source_reference.page_number == 2


def test_original_result_remains_unchanged(validated_evidence):
    result = make_result(validated_evidence)

    enriched = ExtractionMetadataService().enrich(
        validated_evidence,
        result,
    )

    assert result.provenance is None
    assert result.blocks[0].source_reference.block_number is None
    assert enriched is not result


def test_reject_mismatched_evidence_id(validated_evidence):
    result = replace(
        make_result(validated_evidence),
        evidence_id=uuid4(),
    )

    with pytest.raises(ExtractionMetadataError, match="evidence ID"):
        ExtractionMetadataService().enrich(
            validated_evidence,
            result,
        )


def test_reject_mismatched_case_id(validated_evidence):
    result = replace(
        make_result(validated_evidence),
        case_id=uuid4(),
    )

    with pytest.raises(ExtractionMetadataError, match="case ID"):
        ExtractionMetadataService().enrich(
            validated_evidence,
            result,
        )


def test_reject_mismatched_file_type(validated_evidence):
    result = replace(
        make_result(validated_evidence),
        file_type="docx",
    )

    with pytest.raises(ExtractionMetadataError, match="file type"):
        ExtractionMetadataService().enrich(
            validated_evidence,
            result,
        )


def test_reject_invalid_page_number(validated_evidence):
    result = make_result(
        validated_evidence,
        references=(SourceReference(page_number=-1),),
    )

    with pytest.raises(ExtractionMetadataError):
        ExtractionMetadataService().enrich(
            validated_evidence,
            result,
        )


def test_reject_invalid_timestamp_order(validated_evidence):
    result = make_result(
        validated_evidence,
        references=(
            SourceReference(
                start_time_seconds=15.0,
                end_time_seconds=5.0,
            ),
        ),
    )

    with pytest.raises(ExtractionMetadataError, match="timestamps"):
        ExtractionMetadataService().enrich(
            validated_evidence,
            result,
        )


def test_reject_incomplete_timestamp(validated_evidence):
    result = make_result(
        validated_evidence,
        references=(SourceReference(start_time_seconds=5.0),),
    )

    with pytest.raises(ExtractionMetadataError, match="together"):
        ExtractionMetadataService().enrich(
            validated_evidence,
            result,
        )


def test_preserve_audio_source_references(validated_evidence):
    result = make_result(
        validated_evidence,
        references=(
            SourceReference(
                start_time_seconds=2.0,
                end_time_seconds=5.0,
            ),
        ),
    )

    enriched = ExtractionMetadataService().enrich(
        validated_evidence,
        result,
    )

    reference = enriched.blocks[0].source_reference

    assert reference.start_time_seconds == 2.0
    assert reference.end_time_seconds == 5.0
    assert reference.block_number == 1


def test_reject_preassigned_block_number(validated_evidence):
    result = make_result(
        validated_evidence,
        references=(SourceReference(block_number=99),),
    )

    with pytest.raises(ExtractionMetadataError, match="Block position"):
        ExtractionMetadataService().enrich(
            validated_evidence,
            result,
        )


def test_reject_duplicate_enrichment(validated_evidence):
    service = ExtractionMetadataService()

    first = service.enrich(
        validated_evidence,
        make_result(validated_evidence),
    )

    with pytest.raises(
        ExtractionMetadataError,
        match="already contains provenance",
    ):
        service.enrich(validated_evidence, first)


def test_empty_extraction_result_is_allowed(validated_evidence):
    result = make_result(
        validated_evidence,
        references=(),
    )

    enriched = ExtractionMetadataService().enrich(
        validated_evidence,
        result,
    )

    assert enriched.blocks == ()
    assert enriched.provenance is not None


def test_reject_inconsistent_source_checksum(validated_evidence):
    descriptor = replace(
        validated_evidence.descriptor,
        checksum="b" * 64,
    )

    inconsistent_file = replace(
        validated_evidence,
        descriptor=descriptor,
    )

    with pytest.raises(ExtractionMetadataError):
        ExtractionMetadataService().enrich(
            inconsistent_file,
            make_result(inconsistent_file),
        )
