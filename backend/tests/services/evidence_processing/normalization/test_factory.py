from dataclasses import replace

import pytest

from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    SourceReference,
)
from app.services.evidence_processing.normalization import (
    ContentNormalizer,
    ContentNormalizerFactory,
    UnsupportedContentNormalizerError,
)


class FakeNormalizer(ContentNormalizer):
    def normalize(
        self,
        block: ExtractedContentBlock,
    ) -> ExtractedContentBlock:
        return replace(
            block,
            text=f"normalized: {block.text}",
        )


class AnotherFakeNormalizer(ContentNormalizer):
    def normalize(
        self,
        block: ExtractedContentBlock,
    ) -> ExtractedContentBlock:
        return replace(
            block,
            text=block.text.upper(),
        )


def test_factory_returns_registered_normalizer() -> None:
    normalizer = FakeNormalizer()
    factory = ContentNormalizerFactory(normalizers={"paragraph": normalizer})

    result = factory.get_normalizer("paragraph")

    assert result is normalizer


def test_factory_selects_correct_normalizer() -> None:
    paragraph_normalizer = FakeNormalizer()
    table_normalizer = AnotherFakeNormalizer()

    factory = ContentNormalizerFactory(
        normalizers={
            "paragraph": paragraph_normalizer,
            "table_row": table_normalizer,
        }
    )

    assert factory.get_normalizer("paragraph") is paragraph_normalizer
    assert factory.get_normalizer("table_row") is table_normalizer


def test_factory_rejects_unsupported_content_type() -> None:
    factory = ContentNormalizerFactory(normalizers={})

    with pytest.raises(
        UnsupportedContentNormalizerError,
        match="unknown",
    ):
        factory.get_normalizer("unknown")


def test_factory_preserves_original_registry() -> None:
    normalizer = FakeNormalizer()
    registry = {"paragraph": normalizer}

    factory = ContentNormalizerFactory(normalizers=registry)

    registry.clear()

    assert factory.get_normalizer("paragraph") is normalizer


def test_normalizer_returns_new_block_without_changing_source() -> None:
    source_reference = SourceReference(page_number=3)

    block = ExtractedContentBlock(
        text="Example evidence",
        content_type="paragraph",
        source_reference=source_reference,
        metadata={"language": "en"},
    )

    normalizer = FakeNormalizer()
    result = normalizer.normalize(block)

    assert result is not block
    assert result.text == "normalized: Example evidence"
    assert result.source_reference == source_reference
    assert result.metadata == block.metadata
    assert block.text == "Example evidence"


def test_abstract_normalizer_cannot_be_instantiated() -> None:
    with pytest.raises(TypeError):
        ContentNormalizer()
