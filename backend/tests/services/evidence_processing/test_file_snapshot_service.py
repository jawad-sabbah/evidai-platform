import hashlib
from dataclasses import replace
from uuid import uuid4

import pytest

from app.core.exceptions import (
    EvidenceFileIntegrityError,
    EvidenceFileNotFoundError,
    EvidenceFileSizeError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.file_snapshot_service import (
    EvidenceFileSnapshotService,
)


@pytest.fixture
def evidence_descriptor(tmp_path):
    content = b"Original investigation evidence"

    path = tmp_path / "evidence.txt"
    path.write_bytes(content)

    return EvidenceFileDescriptor(
        evidence_id=uuid4(),
        case_id=uuid4(),
        path=path,
        original_filename="evidence.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=len(content),
        checksum=hashlib.sha256(content).hexdigest(),
    )


@pytest.fixture
def snapshot_service():
    return EvidenceFileSnapshotService(max_size_bytes=1024)


def test_snapshot_contains_original_content(
    evidence_descriptor,
    snapshot_service,
):
    with snapshot_service.open_snapshot(evidence_descriptor) as snapshot:
        assert snapshot.path.read_bytes() == (evidence_descriptor.path.read_bytes())
        assert snapshot.path != evidence_descriptor.path
        assert snapshot.checksum == evidence_descriptor.checksum


def test_snapshot_preserves_metadata(
    evidence_descriptor,
    snapshot_service,
):
    with snapshot_service.open_snapshot(evidence_descriptor) as snapshot:
        assert snapshot.evidence_id == evidence_descriptor.evidence_id
        assert snapshot.case_id == evidence_descriptor.case_id
        assert snapshot.original_filename == "evidence.txt"
        assert snapshot.file_type == "txt"


def test_snapshot_removed_after_context(
    evidence_descriptor,
    snapshot_service,
):
    with snapshot_service.open_snapshot(evidence_descriptor) as snapshot:
        snapshot_path = snapshot.path
        assert snapshot_path.exists()

    assert not snapshot_path.exists()
    assert evidence_descriptor.path.exists()


def test_snapshot_removed_after_exception(
    evidence_descriptor,
    snapshot_service,
):
    snapshot_path = None

    with (
        pytest.raises(RuntimeError),
        snapshot_service.open_snapshot(evidence_descriptor) as snapshot,
    ):
        snapshot_path = snapshot.path
        raise RuntimeError("Simulated extraction failure")

    assert snapshot_path is not None
    assert not snapshot_path.exists()
    assert evidence_descriptor.path.exists()


def test_source_changes_do_not_modify_snapshot(
    evidence_descriptor,
    snapshot_service,
):
    original = evidence_descriptor.path.read_bytes()

    with snapshot_service.open_snapshot(evidence_descriptor) as snapshot:
        evidence_descriptor.path.write_bytes(b"Changed content")

        assert snapshot.path.read_bytes() == original


def test_reject_changed_checksum(
    evidence_descriptor,
    snapshot_service,
):
    evidence_descriptor.path.write_bytes(b"Modified investigation evidence")

    with (
        pytest.raises(EvidenceFileIntegrityError),
        snapshot_service.open_snapshot(evidence_descriptor),
    ):
        pass


def test_reject_incorrect_stored_size(
    evidence_descriptor,
    snapshot_service,
):
    descriptor = replace(
        evidence_descriptor,
        file_size=evidence_descriptor.file_size + 1,
    )

    with (
        pytest.raises(EvidenceFileIntegrityError),
        snapshot_service.open_snapshot(descriptor),
    ):
        pass


def test_reject_oversized_source(evidence_descriptor):
    service = EvidenceFileSnapshotService(max_size_bytes=5)

    with (
        pytest.raises(EvidenceFileSizeError),
        service.open_snapshot(evidence_descriptor),
    ):
        pass


def test_reject_empty_source(
    evidence_descriptor,
    snapshot_service,
):
    evidence_descriptor.path.write_bytes(b"")

    descriptor = replace(
        evidence_descriptor,
        file_size=0,
        checksum=hashlib.sha256(b"").hexdigest(),
    )

    with (
        pytest.raises(EvidenceFileSizeError),
        snapshot_service.open_snapshot(descriptor),
    ):
        pass


def test_reject_missing_source(
    evidence_descriptor,
    snapshot_service,
):
    evidence_descriptor.path.unlink()

    with (
        pytest.raises(EvidenceFileNotFoundError),
        snapshot_service.open_snapshot(evidence_descriptor),
    ):
        pass


def test_reject_missing_checksum(
    evidence_descriptor,
    snapshot_service,
):
    descriptor = replace(
        evidence_descriptor,
        checksum=None,
    )

    with (
        pytest.raises(EvidenceFileIntegrityError),
        snapshot_service.open_snapshot(descriptor),
    ):
        pass


def test_reject_invalid_configuration():
    with pytest.raises(ValueError):
        EvidenceFileSnapshotService(max_size_bytes=0)
