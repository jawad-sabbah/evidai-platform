from pathlib import Path
from uuid import uuid4

import pytest
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas

from app.core.exceptions import (
    EncryptedEvidencePdfError,
    PdfExtractionError,
    PdfExtractionLimitError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.pdf_extractor import (
    PdfTextExtractor,
)


def make_validated_file(path: Path) -> ValidatedEvidenceFile:
    descriptor = EvidenceFileDescriptor(
        evidence_id=uuid4(),
        case_id=uuid4(),
        path=path,
        original_filename=path.name,
        file_type="pdf",
        mime_type="application/pdf",
        file_size=path.stat().st_size,
        checksum=None,
    )

    return ValidatedEvidenceFile(
        descriptor=descriptor,
        detected_file_type="pdf",
        verified_size=path.stat().st_size,
        verified_checksum="",
    )


def create_pdf(path: Path, page_texts: list[str]) -> None:
    document = canvas.Canvas(str(path))

    for text in page_texts:
        if text:
            document.drawString(50, 750, text)
        document.showPage()

    document.save()


def test_extract_single_page_pdf(tmp_path):
    path = tmp_path / "report.pdf"
    create_pdf(path, ["Investigation Report"])

    validated_file = make_validated_file(path)
    extractor = PdfTextExtractor()

    result = extractor.extract(validated_file)

    assert result.file_type == "pdf"
    assert result.extractor_name == "pypdf"
    assert result.metadata["page_count"] == 1
    assert len(result.blocks) == 1
    assert "Investigation Report" in result.blocks[0].text
    assert result.blocks[0].source_reference.page_number == 1


def test_extract_multiple_pages(tmp_path):
    path = tmp_path / "report.pdf"
    create_pdf(
        path,
        [
            "First Page Evidence",
            "Second Page Evidence",
            "Third Page Evidence",
        ],
    )

    result = PdfTextExtractor().extract(make_validated_file(path))

    assert len(result.blocks) == 3
    assert result.metadata["page_count"] == 3

    for index, block in enumerate(result.blocks, start=1):
        assert block.source_reference.page_number == index

    assert "First Page Evidence" in result.blocks[0].text
    assert "Second Page Evidence" in result.blocks[1].text
    assert "Third Page Evidence" in result.blocks[2].text


def test_empty_page_is_flagged_for_ocr(tmp_path):
    path = tmp_path / "scanned.pdf"
    create_pdf(path, [""])

    result = PdfTextExtractor().extract(make_validated_file(path))

    assert result.blocks[0].metadata["requires_ocr"] is True
    assert result.metadata["ocr_recommended"] is True
    assert result.metadata["pages_without_text"] == (1,)


def test_preserve_evidence_identity(tmp_path):
    path = tmp_path / "report.pdf"
    create_pdf(path, ["Original Evidence"])

    validated_file = make_validated_file(path)

    result = PdfTextExtractor().extract(validated_file)

    assert result.evidence_id == validated_file.descriptor.evidence_id
    assert result.case_id == validated_file.descriptor.case_id


def test_reject_non_pdf_descriptor(tmp_path):
    path = tmp_path / "notes.txt"
    path.write_text("Text evidence", encoding="utf-8")

    validated_file = make_validated_file(path)

    validated_file = ValidatedEvidenceFile(
        descriptor=validated_file.descriptor,
        detected_file_type="txt",
        verified_size=validated_file.verified_size,
        verified_checksum=validated_file.verified_checksum,
    )

    with pytest.raises(PdfExtractionError):
        PdfTextExtractor().extract(validated_file)


def test_reject_malformed_pdf(tmp_path):
    path = tmp_path / "broken.pdf"
    path.write_bytes(b"%PDF-1.7\ninvalid content")

    with pytest.raises(PdfExtractionError):
        PdfTextExtractor().extract(make_validated_file(path))


def test_reject_encrypted_pdf(tmp_path):
    source_path = tmp_path / "source.pdf"
    encrypted_path = tmp_path / "encrypted.pdf"

    create_pdf(source_path, ["Confidential Evidence"])

    reader = PdfReader(source_path)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    writer.encrypt("test-password")

    with encrypted_path.open("wb") as destination:
        writer.write(destination)

    with pytest.raises(EncryptedEvidencePdfError):
        PdfTextExtractor().extract(make_validated_file(encrypted_path))


def test_reject_pdf_exceeding_page_limit(tmp_path):
    path = tmp_path / "many_pages.pdf"
    create_pdf(path, ["Page One", "Page Two", "Page Three"])

    extractor = PdfTextExtractor(max_pages=2)

    with pytest.raises(PdfExtractionLimitError):
        extractor.extract(make_validated_file(path))


def test_reject_excessive_extracted_text(tmp_path):
    path = tmp_path / "long_text.pdf"
    create_pdf(path, ["Long investigation evidence"])

    extractor = PdfTextExtractor(max_extracted_characters=5)

    with pytest.raises(PdfExtractionLimitError):
        extractor.extract(make_validated_file(path))


def test_original_pdf_remains_unchanged(tmp_path):
    path = tmp_path / "original.pdf"
    create_pdf(path, ["Original investigation evidence"])

    original_bytes = path.read_bytes()

    PdfTextExtractor().extract(make_validated_file(path))

    assert path.read_bytes() == original_bytes


@pytest.mark.parametrize(
    ("max_pages", "max_characters"),
    [
        (0, 1000),
        (10, 0),
        (-1, 1000),
    ],
)
def test_reject_invalid_extractor_configuration(
    max_pages,
    max_characters,
):
    with pytest.raises(ValueError):
        PdfTextExtractor(
            max_pages=max_pages,
            max_extracted_characters=max_characters,
        )
