import hashlib
from pathlib import Path
from uuid import uuid4

import pytest

from app.core.exceptions import (
    TextExtractionError,
    TextExtractionLimitError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.csv_extractor import (
    CsvExtractor,
)
from app.services.evidence_processing.extractors.json_extractor import (
    JsonExtractor,
)
from app.services.evidence_processing.extractors.txt_extractor import (
    TxtExtractor,
)
from app.services.evidence_processing.extractors.xml_extractor import (
    XmlExtractor,
)


def make_evidence(
    tmp_path: Path,
    filename: str,
    content: bytes,
) -> ValidatedEvidenceFile:
    path = tmp_path / filename
    path.write_bytes(content)

    file_type = path.suffix.lstrip(".")
    checksum = hashlib.sha256(content).hexdigest()

    descriptor = EvidenceFileDescriptor(
        evidence_id=uuid4(),
        case_id=uuid4(),
        path=path,
        original_filename=filename,
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


def test_txt_preserves_lines(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "notes.txt",
        b"First line\r\n\r\nThird line",
    )

    result = TxtExtractor().extract(evidence)

    assert len(result.blocks) == 3
    assert result.blocks[0].text == "First line\r\n"
    assert result.blocks[1].text == "\r\n"
    assert result.blocks[2].text == "Third line"
    assert result.blocks[2].metadata["line_number"] == 3


def test_csv_preserves_cells_and_rows(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "transactions.csv",
        b"ID,Amount\nTX-101,5000\nTX-102,2400\n",
    )

    result = CsvExtractor().extract(evidence)

    assert len(result.blocks) == 3
    assert result.blocks[1].metadata["cells"] == ("TX-101", "5000")
    assert result.blocks[1].source_reference.row_number == 2
    assert result.metadata["row_count"] == 3


def test_csv_preserves_quoted_commas(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "people.csv",
        b'name,description\nAlice,"Witness, present"\n',
    )

    result = CsvExtractor().extract(evidence)

    assert result.blocks[1].metadata["cells"] == (
        "Alice",
        "Witness, present",
    )


def test_json_preserves_structured_data(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "case.json",
        b'{"case_id": 101, "status": "open"}',
    )

    result = JsonExtractor().extract(evidence)

    assert result.blocks[0].metadata["structured_data"] == {
        "case_id": 101,
        "status": "open",
    }
    assert result.blocks[0].content_type == "json_document"


def test_json_rejects_invalid_document(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "broken.json",
        b'{"invalid":}',
    )

    with pytest.raises(TextExtractionError):
        JsonExtractor().extract(evidence)


def test_xml_preserves_root_metadata(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "case.xml",
        b'<case id="101"><status>open</status></case>',
    )

    result = XmlExtractor().extract(evidence)

    assert result.blocks[0].metadata["root_tag"] == "case"
    assert result.blocks[0].metadata["root_attributes"] == {"id": "101"}
    assert result.blocks[0].metadata["element_count"] == 2


def test_xml_rejects_entities(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "unsafe.xml",
        b'<!DOCTYPE x [<!ENTITY a "test">]><x>&a;</x>',
    )

    with pytest.raises(TextExtractionError):
        XmlExtractor().extract(evidence)


def test_reject_binary_text(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "binary.txt",
        b"Hello\x00World",
    )

    with pytest.raises(TextExtractionError):
        TxtExtractor().extract(evidence)


def test_reject_invalid_utf8(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "invalid.txt",
        b"\xff\xfe",
    )

    with pytest.raises(TextExtractionError):
        TxtExtractor().extract(evidence)


def test_reject_wrong_extractor(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "notes.txt",
        b"Evidence notes",
    )

    with pytest.raises(TextExtractionError):
        JsonExtractor().extract(evidence)


def test_original_evidence_unchanged(tmp_path):
    content = b"Original investigation evidence"
    evidence = make_evidence(tmp_path, "notes.txt", content)

    TxtExtractor().extract(evidence)

    assert evidence.descriptor.path.read_bytes() == content


def test_extraction_preserves_evidence_identity(tmp_path):
    evidence = make_evidence(tmp_path, "notes.txt", b"Evidence")

    result = TxtExtractor().extract(evidence)

    assert result.evidence_id == evidence.descriptor.evidence_id
    assert result.case_id == evidence.descriptor.case_id


def test_reject_oversized_text(tmp_path):
    from app.services.evidence_processing.extractors.text_support import (
        read_evidence_text,
    )

    evidence = make_evidence(
        tmp_path,
        "large.txt",
        b"A" * 100,
    )

    with pytest.raises(TextExtractionLimitError):
        read_evidence_text(
            evidence,
            expected_type="txt",
            max_bytes=10,
        )
