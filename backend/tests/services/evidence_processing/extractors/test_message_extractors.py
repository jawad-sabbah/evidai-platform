import hashlib
import json
from email.message import EmailMessage
from pathlib import Path
from uuid import uuid4

import pytest

from app.core.exceptions import (
    MessageExtractionError,
    MessageExtractionLimitError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.chat_json_extractor import (
    ChatJsonExtractor,
)
from app.services.evidence_processing.extractors.eml_extractor import (
    EmlExtractor,
)


def make_evidence(
    tmp_path: Path,
    filename: str,
    content: bytes,
) -> ValidatedEvidenceFile:
    path = tmp_path / filename
    path.write_bytes(content)

    checksum = hashlib.sha256(content).hexdigest()
    file_type = path.suffix.lstrip(".")

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


def make_email() -> bytes:
    message = EmailMessage()
    message["From"] = "alice@example.com"
    message["To"] = "bob@example.com"
    message["Subject"] = "Invoice evidence"
    message["Date"] = "Sat, 10 Oct 2026 09:00:00 +0000"
    message["Message-ID"] = "<evidence-101@example.com>"
    message.set_content("Please check transaction TX-101.")

    return message.as_bytes()


def make_chat() -> bytes:
    document = {
        "messages": [
            {
                "id": "msg-001",
                "sender": "Alice",
                "timestamp": "2026-10-10T09:00:00Z",
                "text": "Did you receive the invoice?",
            },
            {
                "id": "msg-002",
                "sender": "Bob",
                "timestamp": "2026-10-10T09:01:00Z",
                "text": "Yes, the amount was $5,000.",
            },
        ]
    }

    return json.dumps(document).encode("utf-8")


def test_extract_eml_body_and_headers(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "message.eml",
        make_email(),
    )

    result = EmlExtractor().extract(evidence)

    assert result.file_type == "eml"
    assert result.metadata["sender"] == "alice@example.com"
    assert result.metadata["recipients"] == "bob@example.com"
    assert result.metadata["subject"] == "Invoice evidence"
    assert len(result.blocks) == 1
    assert "TX-101" in result.blocks[0].text
    assert result.blocks[0].source_reference.message_id == (
        "<evidence-101@example.com>"
    )


def test_eml_does_not_extract_attachments(tmp_path):
    message = EmailMessage()
    message["From"] = "alice@example.com"
    message["To"] = "bob@example.com"
    message.set_content("See attached evidence.")
    message.add_attachment(
        b"Sensitive attachment bytes",
        maintype="application",
        subtype="octet-stream",
        filename="attachment.bin",
    )

    evidence = make_evidence(
        tmp_path,
        "with_attachment.eml",
        message.as_bytes(),
    )

    result = EmlExtractor().extract(evidence)

    assert result.metadata["attachment_count"] == 1
    assert len(result.blocks) == 1
    assert "Sensitive attachment bytes" not in result.blocks[0].text


def test_reject_oversized_email(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "large.eml",
        make_email(),
    )

    with pytest.raises(MessageExtractionLimitError):
        EmlExtractor(max_file_bytes=10).extract(evidence)


def test_extract_chat_messages_in_original_order(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "conversation.json",
        make_chat(),
    )

    result = ChatJsonExtractor().extract(evidence)

    assert result.metadata["message_count"] == 2
    assert result.blocks[0].source_reference.message_id == "msg-001"
    assert result.blocks[1].source_reference.message_id == "msg-002"
    assert result.blocks[0].metadata["sender"] == "Alice"
    assert result.blocks[1].metadata["sender"] == "Bob"
    assert result.blocks[1].text == "Yes, the amount was $5,000."


def test_chat_preserves_evidence_identity(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "conversation.json",
        make_chat(),
    )

    result = ChatJsonExtractor().extract(evidence)

    assert result.evidence_id == evidence.descriptor.evidence_id
    assert result.case_id == evidence.descriptor.case_id


def test_reject_duplicate_message_ids(tmp_path):
    document = json.loads(make_chat())
    document["messages"][1]["id"] = "msg-001"

    evidence = make_evidence(
        tmp_path,
        "duplicate.json",
        json.dumps(document).encode("utf-8"),
    )

    with pytest.raises(MessageExtractionError, match="Duplicate message ID"):
        ChatJsonExtractor().extract(evidence)


def test_reject_invalid_timestamp(tmp_path):
    document = json.loads(make_chat())
    document["messages"][0]["timestamp"] = "not-a-timestamp"

    evidence = make_evidence(
        tmp_path,
        "invalid_timestamp.json",
        json.dumps(document).encode("utf-8"),
    )

    with pytest.raises(MessageExtractionError, match="invalid timestamp"):
        ChatJsonExtractor().extract(evidence)


def test_reject_timestamp_without_timezone(tmp_path):
    document = json.loads(make_chat())
    document["messages"][0]["timestamp"] = "2026-10-10T09:00:00"

    evidence = make_evidence(
        tmp_path,
        "no_timezone.json",
        json.dumps(document).encode("utf-8"),
    )

    with pytest.raises(MessageExtractionError, match="timezone"):
        ChatJsonExtractor().extract(evidence)


def test_reject_duplicate_json_properties(tmp_path):
    content = b'{"messages": [], "messages": []}'

    evidence = make_evidence(
        tmp_path,
        "duplicate_properties.json",
        content,
    )

    with pytest.raises(MessageExtractionError, match="Duplicate JSON"):
        ChatJsonExtractor().extract(evidence)


def test_reject_invalid_chat_schema(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "invalid_schema.json",
        b'{"events": []}',
    )

    with pytest.raises(MessageExtractionError):
        ChatJsonExtractor().extract(evidence)


def test_enforce_chat_message_limit(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "conversation.json",
        make_chat(),
    )

    with pytest.raises(MessageExtractionLimitError):
        ChatJsonExtractor(max_messages=1).extract(evidence)


def test_original_files_remain_unchanged(tmp_path):
    for filename, content, extractor in (
        ("message.eml", make_email(), EmlExtractor()),
        ("conversation.json", make_chat(), ChatJsonExtractor()),
    ):
        evidence = make_evidence(tmp_path, filename, content)

        extractor.extract(evidence)

        assert evidence.descriptor.path.read_bytes() == content


def test_reject_incorrect_format(tmp_path):
    evidence = make_evidence(
        tmp_path,
        "notes.txt",
        b"Plain text",
    )

    with pytest.raises(MessageExtractionError):
        EmlExtractor().extract(evidence)

    with pytest.raises(MessageExtractionError):
        ChatJsonExtractor().extract(evidence)
