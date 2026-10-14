import hashlib
from collections.abc import Iterator
from contextlib import contextmanager
from uuid import uuid4

import pytest

from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.csv_extractor import (
    CsvExtractor,
)
from app.services.evidence_processing.extractors.docx_extractor import (
    DocxTextExtractor,
)
from app.services.evidence_processing.extractors.factory import (
    EvidenceExtractorFactory,
)
from app.services.evidence_processing.extractors.json_extractor import (
    JsonExtractor,
)
from app.services.evidence_processing.extractors.pdf_extractor import (
    PdfTextExtractor,
)
from app.services.evidence_processing.extractors.txt_extractor import (
    TxtExtractor,
)
from app.services.evidence_processing.extractors.xlsx_extractor import (
    XlsxExtractor,
)
from app.services.evidence_processing.extractors.xml_extractor import (
    XmlExtractor,
)
from app.services.evidence_processing.file_snapshot_service import (
    EvidenceFileSnapshotService,
)


@pytest.fixture
def extractor_factory() -> EvidenceExtractorFactory:
    """Register the real document and structured-data extractors."""

    return EvidenceExtractorFactory(
        extractors={
            "pdf": PdfTextExtractor(),
            "docx": DocxTextExtractor(),
            "txt": TxtExtractor(),
            "csv": CsvExtractor(),
            "json": JsonExtractor(),
            "xml": XmlExtractor(),
            "xlsx": XlsxExtractor(),
        }
    )


@pytest.fixture
def snapshot_service() -> EvidenceFileSnapshotService:
    return EvidenceFileSnapshotService(max_size_bytes=10 * 1024 * 1024)


@pytest.fixture
def evidence_builder(tmp_path):
    """Build an evidence descriptor backed by actual file bytes."""

    def build(
        filename: str,
        content: bytes,
    ) -> EvidenceFileDescriptor:
        evidence_path = tmp_path / filename
        evidence_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )
        evidence_path.write_bytes(content)

        return EvidenceFileDescriptor(
            evidence_id=uuid4(),
            case_id=uuid4(),
            path=evidence_path,
            original_filename=filename,
            file_type=evidence_path.suffix.lstrip("."),
            mime_type=None,
            file_size=len(content),
            checksum=hashlib.sha256(content).hexdigest(),
        )

    return build


@pytest.fixture
def validated_snapshot(snapshot_service):
    """Expose a verified snapshot only while its context is active."""

    @contextmanager
    def open_validated_snapshot(
        descriptor: EvidenceFileDescriptor,
    ) -> Iterator[ValidatedEvidenceFile]:
        with snapshot_service.open_snapshot(descriptor) as snapshot:
            yield ValidatedEvidenceFile(
                descriptor=snapshot,
                detected_file_type=descriptor.file_type.lower(),
                verified_size=descriptor.file_size,
                verified_checksum=descriptor.checksum,
            )

    return open_validated_snapshot
