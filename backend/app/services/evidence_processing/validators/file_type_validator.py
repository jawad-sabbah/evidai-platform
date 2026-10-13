import csv
import io
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import BadZipFile, ZipFile

from app.core.exceptions import (
    EvidenceFileTypeMismatchError,
    UnsupportedEvidenceFileTypeError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)


class EvidenceFileTypeValidator:
    """Verify supported evidence formats against actual file contents."""

    SUPPORTED_TYPES = frozenset({"pdf", "docx", "xlsx", "txt", "csv", "json", "xml"})

    def validate(self, descriptor: EvidenceFileDescriptor) -> str:
        declared_type = descriptor.file_type.lower().lstrip(".")
        extension = Path(descriptor.original_filename).suffix.lower().lstrip(".")

        if declared_type not in self.SUPPORTED_TYPES:
            raise UnsupportedEvidenceFileTypeError("Unsupported evidence file type")

        if extension != declared_type:
            raise EvidenceFileTypeMismatchError(
                "Evidence filename and declared file type do not match"
            )

        try:
            with descriptor.open() as file:
                signature = file.read(8)

            if declared_type == "pdf":
                valid = signature.startswith(b"%PDF-")
            elif declared_type in {"docx", "xlsx"}:
                valid = self._validate_office(descriptor.path, declared_type)
            else:
                valid = self._validate_text_format(
                    descriptor.path,
                    declared_type,
                )
        except (OSError, BadZipFile, UnicodeError, ValueError, ET.ParseError):
            valid = False

        if not valid:
            raise EvidenceFileTypeMismatchError(
                "Evidence contents do not match the declared file type"
            )

        return declared_type

    def _validate_office(self, path: Path, file_type: str) -> bool:
        marker = {
            "docx": "word/document.xml",
            "xlsx": "xl/workbook.xml",
        }[file_type]

        with ZipFile(path) as archive:
            return marker in archive.namelist()

    def _validate_text_format(self, path: Path, file_type: str) -> bool:
        # This initial implementation reads text files into memory.
        # Subtask 3 will enforce a file size limit before validation.
        data = path.read_bytes()

        if b"\x00" in data:
            return False

        try:
            content = data.decode("utf-8-sig")
        except UnicodeDecodeError:
            return False

        if any(ord(char) < 32 and char not in "\r\n\t" for char in content):
            return False

        if file_type == "txt":
            return True

        if file_type == "json":
            json.loads(content)
            return True

        if file_type == "xml":
            ET.fromstring(content)
            return True

        if file_type == "csv":
            rows = list(csv.reader(io.StringIO(content)))
            return bool(rows) and any(row for row in rows)

        return False


evidence_file_type_validator = EvidenceFileTypeValidator()
