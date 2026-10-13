import csv
import io
import json
import re
import stat
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import BadZipFile, ZipFile, is_zipfile

from app.core.exceptions import (
    EvidenceFileTypeMismatchError,
    MalformedEvidenceFileError,
    UnsafeEvidenceArchiveError,
    UnsupportedEvidenceFileTypeError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)

MAX_INSPECTION_BYTES = 8 * 1024 * 1024
MAX_ARCHIVE_ENTRIES = 1000
MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024
MAX_COMPRESSION_RATIO = 100

OFFICE_MARKERS = {
    "docx": "word/document.xml",
    "xlsx": "xl/workbook.xml",
}

SUPPORTED_TYPES = frozenset({"pdf", "docx", "xlsx", "txt", "csv", "json", "xml"})


class EvidenceFileTypeValidator:
    """Inspect evidence formats with bounded reads and archive checks."""

    def validate(self, descriptor: EvidenceFileDescriptor) -> str:
        declared_type = descriptor.file_type.lower().lstrip(".")
        extension = (
            Path(descriptor.original_filename.replace("\\", "/"))
            .suffix.lower()
            .lstrip(".")
        )

        if declared_type not in SUPPORTED_TYPES:
            raise UnsupportedEvidenceFileTypeError("Unsupported evidence file type")

        if extension != declared_type:
            raise EvidenceFileTypeMismatchError(
                "Filename extension does not match declared file type"
            )

        try:
            if declared_type in OFFICE_MARKERS:
                self._validate_office(descriptor.path, declared_type)
            elif declared_type == "pdf":
                self._validate_pdf(descriptor.path)
            else:
                self._validate_text(descriptor.path, declared_type)

        except (OSError, BadZipFile, UnicodeError) as exc:
            raise MalformedEvidenceFileError(
                "Evidence file cannot be inspected"
            ) from exc

        return declared_type

    def _read_bounded(self, path: Path) -> bytes:
        """Read at most the permitted inspection size."""

        with path.open("rb") as file:
            data = file.read(MAX_INSPECTION_BYTES + 1)

        if len(data) > MAX_INSPECTION_BYTES:
            raise UnsafeEvidenceArchiveError("File exceeds the format inspection limit")

        return data

    def _validate_pdf(self, path: Path) -> None:
        """Perform basic PDF header and trailer verification."""

        with path.open("rb") as file:
            header = file.read(8)

            if not re.match(rb"^%PDF-[12]\.\d", header):
                raise EvidenceFileTypeMismatchError("Invalid PDF signature")

            file.seek(0, 2)
            size = file.tell()

            if size < 20:
                raise MalformedEvidenceFileError("PDF file is incomplete")

            file.seek(max(0, size - 4096))
            trailer = file.read()

        if b"%%EOF" not in trailer or b"startxref" not in trailer:
            raise MalformedEvidenceFileError("PDF trailer is missing or incomplete")

    def _validate_office(self, path: Path, file_type: str) -> None:
        """Inspect ZIP metadata before opening Office document content."""

        if not is_zipfile(path):
            raise EvidenceFileTypeMismatchError("Office file is not a ZIP container")

        with ZipFile(path) as archive:
            entries = archive.infolist()

            if len(entries) > MAX_ARCHIVE_ENTRIES:
                raise UnsafeEvidenceArchiveError(
                    "Office archive contains too many entries"
                )

            names = set()
            total_size = 0

            for entry in entries:
                name = entry.filename.replace("\\", "/")

                if (
                    name.startswith(("/", "../"))
                    or ".." in name.split("/")
                    or re.match(r"^[A-Za-z]:", name)
                ):
                    raise UnsafeEvidenceArchiveError(
                        "Office archive contains an unsafe path"
                    )

                if name in names:
                    raise UnsafeEvidenceArchiveError(
                        "Office archive contains duplicate entries"
                    )
                names.add(name)

                if entry.flag_bits & 0x1:
                    raise UnsafeEvidenceArchiveError(
                        "Encrypted Office archives are not supported"
                    )

                mode = entry.external_attr >> 16
                if stat.S_IFMT(mode) == stat.S_IFLNK:
                    raise UnsafeEvidenceArchiveError(
                        "Archive symbolic links are not supported"
                    )

                total_size += entry.file_size
                if total_size > MAX_UNCOMPRESSED_BYTES:
                    raise UnsafeEvidenceArchiveError(
                        "Office archive expands beyond the permitted size"
                    )

                if entry.file_size > 0:
                    if entry.compress_size == 0:
                        raise UnsafeEvidenceArchiveError(
                            "Invalid archive compression size"
                        )

                    ratio = entry.file_size / entry.compress_size
                    if ratio > MAX_COMPRESSION_RATIO:
                        raise UnsafeEvidenceArchiveError(
                            "Suspicious Office archive compression ratio"
                        )

            required = {
                "[Content_Types].xml",
                OFFICE_MARKERS[file_type],
            }

            if not required.issubset(names):
                raise EvidenceFileTypeMismatchError(
                    "Office archive is missing required document parts"
                )

            # Verify the central directory and the uncompressed bytes.
            for entry in entries:
                with archive.open(entry) as member:
                    remaining = entry.file_size

                    while remaining > 0:
                        chunk = member.read(min(65536, remaining))
                        if not chunk:
                            raise MalformedEvidenceFileError(
                                "Office archive member is incomplete"
                            )
                        remaining -= len(chunk)

                    if member.read(1):
                        raise UnsafeEvidenceArchiveError(
                            "Archive member exceeded its declared size"
                        )

    def _validate_text(self, path: Path, file_type: str) -> None:
        """Validate bounded UTF-8 text and structured text formats."""

        data = self._read_bounded(path)

        if b"\x00" in data:
            raise EvidenceFileTypeMismatchError(
                "Binary content detected in text evidence"
            )

        try:
            content = data.decode("utf-8-sig")
        except UnicodeDecodeError as exc:
            raise EvidenceFileTypeMismatchError(
                "Text evidence is not valid UTF-8"
            ) from exc

        if any(ord(char) < 32 and char not in "\r\n\t" for char in content):
            raise EvidenceFileTypeMismatchError(
                "Invalid control characters in text evidence"
            )

        if file_type == "txt":
            return

        if file_type == "json":
            try:
                json.loads(content)
            except (ValueError, RecursionError) as exc:
                raise MalformedEvidenceFileError("Invalid JSON document") from exc
            return

        if file_type == "xml":
            if re.search(
                r"<!\s*(?:DOCTYPE|ENTITY)\b",
                content,
                flags=re.IGNORECASE,
            ):
                raise UnsafeEvidenceArchiveError(
                    "XML document declarations are not permitted"
                )

            try:
                ET.fromstring(content)
            except (ET.ParseError, RecursionError) as exc:
                raise MalformedEvidenceFileError("Invalid XML document") from exc
            return

        if file_type == "csv":
            try:
                reader = csv.reader(
                    io.StringIO(content),
                    strict=True,
                )
                row_found = False
                for row in reader:
                    if row:
                        row_found = True

                if not row_found:
                    raise MalformedEvidenceFileError("CSV document contains no records")
            except csv.Error as exc:
                raise MalformedEvidenceFileError("Invalid CSV document") from exc


evidence_file_type_validator = EvidenceFileTypeValidator()
