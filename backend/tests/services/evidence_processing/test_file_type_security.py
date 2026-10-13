from uuid import uuid4
from zipfile import ZIP_DEFLATED, ZipFile

import pytest

from app.core.exceptions import (
    EvidenceFileTypeMismatchError,
    MalformedEvidenceFileError,
    UnsafeEvidenceArchiveError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.validators.file_type_validator import (
    EvidenceFileTypeValidator,
)


@pytest.fixture
def validator():
    return EvidenceFileTypeValidator()


def make_descriptor(path, file_type):
    return EvidenceFileDescriptor(
        evidence_id=uuid4(),
        case_id=uuid4(),
        path=path,
        original_filename=path.name,
        file_type=file_type,
        mime_type=None,
        file_size=path.stat().st_size,
        checksum=None,
    )


def test_reject_pdf_without_trailer(tmp_path, validator):
    path = tmp_path / "broken.pdf"
    path.write_bytes(b"%PDF-1.7\nIncomplete PDF")

    with pytest.raises(MalformedEvidenceFileError):
        validator.validate(make_descriptor(path, "pdf"))


def test_reject_fake_pdf(tmp_path, validator):
    path = tmp_path / "fake.pdf"
    path.write_bytes(b"Not a PDF")

    with pytest.raises(EvidenceFileTypeMismatchError):
        validator.validate(make_descriptor(path, "pdf"))


def test_reject_office_zip_bomb(tmp_path, validator):
    path = tmp_path / "bomb.docx"

    with ZipFile(path, "w", compression=ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr(
            "word/document.xml",
            b"A" * (1024 * 1024),
        )

    with pytest.raises(UnsafeEvidenceArchiveError):
        validator.validate(make_descriptor(path, "docx"))


def test_reject_zip_path_traversal(tmp_path, validator):
    path = tmp_path / "unsafe.docx"

    with ZipFile(path, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr("word/document.xml", "<document/>")
        archive.writestr("../outside.txt", "unsafe")

    with pytest.raises(UnsafeEvidenceArchiveError):
        validator.validate(make_descriptor(path, "docx"))


def test_reject_missing_office_parts(tmp_path, validator):
    path = tmp_path / "broken.xlsx"

    with ZipFile(path, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")

    with pytest.raises(EvidenceFileTypeMismatchError):
        validator.validate(make_descriptor(path, "xlsx"))


def test_reject_xml_entities(tmp_path, validator):
    path = tmp_path / "unsafe.xml"
    path.write_text(
        '<!DOCTYPE x [<!ENTITY a "test">]><x>&a;</x>',
        encoding="utf-8",
    )

    with pytest.raises(UnsafeEvidenceArchiveError):
        validator.validate(make_descriptor(path, "xml"))


def test_reject_oversized_text_inspection(tmp_path, validator):
    path = tmp_path / "large.txt"
    path.write_bytes(b"A" * (8 * 1024 * 1024 + 1))

    with pytest.raises(UnsafeEvidenceArchiveError):
        validator.validate(make_descriptor(path, "txt"))


def test_reject_invalid_json(tmp_path, validator):
    path = tmp_path / "broken.json"
    path.write_bytes(b'{"invalid":}')

    with pytest.raises(MalformedEvidenceFileError):
        validator.validate(make_descriptor(path, "json"))


def test_valid_json(tmp_path, validator):
    path = tmp_path / "valid.json"
    path.write_bytes(b'{"evidence": "valid"}')

    assert validator.validate(make_descriptor(path, "json")) == "json"
