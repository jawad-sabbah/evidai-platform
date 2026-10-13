import json
from pathlib import Path
from uuid import uuid4
from zipfile import ZipFile

import pytest

from app.core.exceptions import (
    EvidenceFileTypeMismatchError,
    UnsupportedEvidenceFileTypeError,
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


def make_descriptor(path: Path, file_type: str) -> EvidenceFileDescriptor:
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


def test_valid_pdf(tmp_path, validator):
    path = tmp_path / "report.pdf"
    path.write_bytes(b"%PDF-1.7\nexample")

    assert validator.validate(make_descriptor(path, "pdf")) == "pdf"


@pytest.mark.parametrize(
    ("extension", "content"),
    [
        ("txt", b"Investigation notes"),
        ("csv", b"name,age\nAlice,30\n"),
        ("json", json.dumps({"case": "EV-194"}).encode()),
        ("xml", b"<evidence><id>123</id></evidence>"),
    ],
)
def test_valid_text_formats(tmp_path, validator, extension, content):
    path = tmp_path / f"evidence.{extension}"
    path.write_bytes(content)

    assert validator.validate(make_descriptor(path, extension)) == extension


@pytest.mark.parametrize(
    ("extension", "marker"),
    [
        ("docx", "word/document.xml"),
        ("xlsx", "xl/workbook.xml"),
    ],
)
def test_valid_office_containers(tmp_path, validator, extension, marker):
    path = tmp_path / f"evidence.{extension}"

    with ZipFile(path, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr(marker, "<document/>")

    assert validator.validate(make_descriptor(path, extension)) == extension


def test_unsupported_file_type(tmp_path, validator):
    path = tmp_path / "malware.exe"
    path.write_bytes(b"MZ")

    with pytest.raises(UnsupportedEvidenceFileTypeError):
        validator.validate(make_descriptor(path, "exe"))


def test_extension_mismatch(tmp_path, validator):
    path = tmp_path / "report.txt"
    path.write_bytes(b"Example")

    with pytest.raises(EvidenceFileTypeMismatchError):
        validator.validate(make_descriptor(path, "pdf"))


def test_fake_pdf(tmp_path, validator):
    path = tmp_path / "fake.pdf"
    path.write_bytes(b"This is not a PDF")

    with pytest.raises(EvidenceFileTypeMismatchError):
        validator.validate(make_descriptor(path, "pdf"))


def test_fake_docx(tmp_path, validator):
    path = tmp_path / "fake.docx"
    path.write_bytes(b"Not a ZIP container")

    with pytest.raises(EvidenceFileTypeMismatchError):
        validator.validate(make_descriptor(path, "docx"))


def test_invalid_json(tmp_path, validator):
    path = tmp_path / "broken.json"
    path.write_bytes(b'{"invalid":}')

    with pytest.raises(EvidenceFileTypeMismatchError):
        validator.validate(make_descriptor(path, "json"))


def test_binary_file_disguised_as_text(tmp_path, validator):
    path = tmp_path / "binary.txt"
    path.write_bytes(b"hello\x00world")

    with pytest.raises(EvidenceFileTypeMismatchError):
        validator.validate(make_descriptor(path, "txt"))
