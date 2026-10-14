import hashlib
from pathlib import Path
from uuid import uuid4

import pymupdf
import pytest
from PIL import Image

from app.core.exceptions import EvidenceOcrError, EvidenceOcrLimitError
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.image_ocr_extractor import (
    ImageOcrExtractor,
)
from app.services.evidence_processing.extractors.scanned_pdf_extractor import (
    ScannedPdfOcrExtractor,
)


class FakeOcrEngine:
    """Deterministic OCR engine for isolated extractor tests."""

    def __init__(self, text: str = "Recognized evidence") -> None:
        self.text = text
        self.call_count = 0

    def recognize(self, image: Image.Image) -> str:
        self.call_count += 1
        assert image.width > 0
        assert image.height > 0
        return self.text


def make_evidence(path: Path, file_type: str) -> ValidatedEvidenceFile:
    content = path.read_bytes()
    checksum = hashlib.sha256(content).hexdigest()

    descriptor = EvidenceFileDescriptor(
        evidence_id=uuid4(),
        case_id=uuid4(),
        path=path,
        original_filename=path.name,
        file_type=file_type,
        mime_type=None,
        file_size=len(content),
        checksum=checksum,
    )

    return ValidatedEvidenceFile(
        descriptor=descriptor,
        detected_file_type=file_type,
        verified_size=len(content),
        verified_checksum=checksum,
    )


def create_image(path: Path, size=(200, 100)) -> None:
    image = Image.new("RGB", size, "white")
    image.save(path)


def create_pdf(path: Path, page_count: int = 2) -> None:
    with pymupdf.open() as document:
        for _ in range(page_count):
            document.new_page(width=300, height=200)
        document.save(str(path))


def test_extract_image_text(tmp_path):
    path = tmp_path / "evidence.png"
    create_image(path)

    engine = FakeOcrEngine("Invoice number 101")
    evidence = make_evidence(path, "png")

    result = ImageOcrExtractor(engine).extract(evidence)

    assert result.blocks[0].text == "Invoice number 101"
    assert result.blocks[0].content_type == "ocr_text"
    assert result.blocks[0].metadata["requires_review"] is True
    assert result.evidence_id == evidence.descriptor.evidence_id
    assert engine.call_count == 1


def test_extract_jpeg_text(tmp_path):
    path = tmp_path / "evidence.jpg"
    create_image(path)

    result = ImageOcrExtractor(FakeOcrEngine("Witness statement")).extract(
        make_evidence(path, "jpg")
    )

    assert result.file_type == "jpg"
    assert result.blocks[0].text == "Witness statement"


def test_reject_oversized_image(tmp_path):
    path = tmp_path / "large.png"
    create_image(path, size=(200, 200))

    engine = FakeOcrEngine()
    extractor = ImageOcrExtractor(engine, max_pixels=100)

    with pytest.raises(EvidenceOcrLimitError):
        extractor.extract(make_evidence(path, "png"))

    assert engine.call_count == 0


def test_reject_corrupted_image(tmp_path):
    path = tmp_path / "broken.png"
    path.write_bytes(b"not a valid image")

    with pytest.raises(EvidenceOcrError):
        ImageOcrExtractor(FakeOcrEngine()).extract(make_evidence(path, "png"))


def test_reject_wrong_image_type(tmp_path):
    path = tmp_path / "notes.txt"
    path.write_text("Evidence", encoding="utf-8")

    with pytest.raises(EvidenceOcrError):
        ImageOcrExtractor(FakeOcrEngine()).extract(make_evidence(path, "txt"))


def test_extract_scanned_pdf_pages(tmp_path):
    path = tmp_path / "scanned.pdf"
    create_pdf(path, page_count=2)

    engine = FakeOcrEngine("Scanned evidence")
    evidence = make_evidence(path, "pdf")

    result = ScannedPdfOcrExtractor(engine).extract(evidence)

    assert len(result.blocks) == 2
    assert engine.call_count == 2
    assert result.blocks[0].source_reference.page_number == 1
    assert result.blocks[1].source_reference.page_number == 2
    assert result.metadata["ocr_applied"] is True
    assert result.case_id == evidence.descriptor.case_id


def test_reject_pdf_exceeding_page_limit(tmp_path):
    path = tmp_path / "many_pages.pdf"
    create_pdf(path, page_count=3)

    engine = FakeOcrEngine()

    with pytest.raises(EvidenceOcrLimitError):
        ScannedPdfOcrExtractor(
            engine,
            max_pages=2,
        ).extract(make_evidence(path, "pdf"))

    assert engine.call_count == 0


def test_reject_pdf_exceeding_pixel_limit(tmp_path):
    path = tmp_path / "large_page.pdf"
    create_pdf(path, page_count=1)

    engine = FakeOcrEngine()

    with pytest.raises(EvidenceOcrLimitError):
        ScannedPdfOcrExtractor(
            engine,
            max_pixels_per_page=100,
        ).extract(make_evidence(path, "pdf"))

    assert engine.call_count == 0


def test_reject_malformed_scanned_pdf(tmp_path):
    path = tmp_path / "invalid.pdf"
    path.write_bytes(b"%PDF-1.7 invalid")

    with pytest.raises(EvidenceOcrError):
        ScannedPdfOcrExtractor(FakeOcrEngine()).extract(make_evidence(path, "pdf"))


def test_original_image_not_modified(tmp_path):
    path = tmp_path / "original.png"
    create_image(path)
    original = path.read_bytes()

    ImageOcrExtractor(FakeOcrEngine()).extract(make_evidence(path, "png"))

    assert path.read_bytes() == original


def test_original_pdf_not_modified(tmp_path):
    path = tmp_path / "original.pdf"
    create_pdf(path)
    original = path.read_bytes()

    ScannedPdfOcrExtractor(FakeOcrEngine()).extract(make_evidence(path, "pdf"))

    assert path.read_bytes() == original


@pytest.mark.parametrize(
    "invalid_dpi",
    [0, 50, 301],
)
def test_reject_invalid_dpi(invalid_dpi):
    with pytest.raises(ValueError):
        ScannedPdfOcrExtractor(
            FakeOcrEngine(),
            dpi=invalid_dpi,
        )
