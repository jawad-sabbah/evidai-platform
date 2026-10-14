import pytest

from app.core.exceptions import UnsupportedEvidenceExtractorError
from app.services.evidence_processing.extractors.base import (
    EvidenceExtractor,
)
from app.services.evidence_processing.extractors.factory import (
    EvidenceExtractorFactory,
)


class FakePdfExtractor(EvidenceExtractor):
    def extract(self, evidence_file):
        raise NotImplementedError


class FakeTextExtractor(EvidenceExtractor):
    def extract(self, evidence_file):
        raise NotImplementedError


@pytest.fixture
def factory():
    return EvidenceExtractorFactory(
        extractors={
            "pdf": FakePdfExtractor(),
            "txt": FakeTextExtractor(),
        }
    )


def test_get_pdf_extractor(factory):
    extractor = factory.get_extractor("pdf")

    assert isinstance(extractor, FakePdfExtractor)


def test_get_text_extractor(factory):
    extractor = factory.get_extractor("txt")

    assert isinstance(extractor, FakeTextExtractor)


def test_file_type_case_insensitive(factory):
    extractor = factory.get_extractor("PDF")

    assert isinstance(extractor, FakePdfExtractor)


def test_file_type_with_leading_dot(factory):
    extractor = factory.get_extractor(".pdf")

    assert isinstance(extractor, FakePdfExtractor)


def test_unsupported_extractor_raises_error(factory):
    with pytest.raises(UnsupportedEvidenceExtractorError):
        factory.get_extractor("mp4")


def test_unregistered_extractor_raises_error():
    factory = EvidenceExtractorFactory()

    with pytest.raises(UnsupportedEvidenceExtractorError):
        factory.get_extractor("pdf")


def test_factory_returns_registered_instance():
    extractor = FakePdfExtractor()

    factory = EvidenceExtractorFactory(extractors={"pdf": extractor})

    assert factory.get_extractor("pdf") is extractor
