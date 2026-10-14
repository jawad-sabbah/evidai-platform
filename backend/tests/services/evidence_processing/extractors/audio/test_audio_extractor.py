import hashlib
from pathlib import Path
from uuid import uuid4

import pytest

from app.core.exceptions import (
    AudioExtractionError,
    AudioExtractionLimitError,
)
from app.services.evidence_processing.dto.file_descriptor import (
    EvidenceFileDescriptor,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.audio.audio_extractor import (
    AudioEvidenceExtractor,
)
from app.services.evidence_processing.extractors.audio.audio_probe import (
    AudioInfo,
)
from app.services.evidence_processing.extractors.audio.speech_transcriber import (
    SpeechSegment,
    TranscriptionResult,
)


class FakeAudioProbe:
    def __init__(self, duration_seconds: float = 10.0):
        self.duration_seconds = duration_seconds
        self.call_count = 0

    def inspect(self, path: Path) -> AudioInfo:
        assert path.exists()
        self.call_count += 1

        return AudioInfo(
            duration_seconds=self.duration_seconds,
            sample_rate=16000,
        )


class FakeSpeechTranscriber:
    def __init__(self, segments=None):
        self.segments = (
            segments
            if segments is not None
            else (
                SpeechSegment(0.0, 3.5, "First statement"),
                SpeechSegment(4.0, 8.0, "Second statement"),
            )
        )
        self.call_count = 0

    def transcribe(self, path: Path) -> TranscriptionResult:
        assert path.exists()
        self.call_count += 1

        return TranscriptionResult(
            language="en",
            segments=tuple(self.segments),
        )


def make_evidence(
    tmp_path: Path,
    filename: str = "interview.wav",
    file_size: int = 128,
) -> ValidatedEvidenceFile:
    path = tmp_path / filename
    content = b"\x00" * file_size
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


def make_extractor(
    audio_probe=None,
    speech_transcriber=None,
    **configuration,
) -> AudioEvidenceExtractor:
    return AudioEvidenceExtractor(
        audio_probe=audio_probe or FakeAudioProbe(),
        speech_transcriber=(speech_transcriber or FakeSpeechTranscriber()),
        **configuration,
    )


def test_extract_timestamped_segments(tmp_path):
    evidence = make_evidence(tmp_path)

    result = make_extractor().extract(evidence)

    assert len(result.blocks) == 2
    assert result.blocks[0].text == "First statement"
    assert result.blocks[0].source_reference.start_time_seconds == 0.0
    assert result.blocks[0].source_reference.end_time_seconds == 3.5
    assert result.blocks[1].source_reference.start_time_seconds == 4.0
    assert result.metadata["detected_language"] == "en"
    assert result.metadata["segment_count"] == 2


def test_preserve_evidence_identity(tmp_path):
    evidence = make_evidence(tmp_path)

    result = make_extractor().extract(evidence)

    assert result.evidence_id == evidence.descriptor.evidence_id
    assert result.case_id == evidence.descriptor.case_id
    assert result.file_type == "wav"


@pytest.mark.parametrize(
    "file_type",
    ["wav", "mp3", "m4a", "flac"],
)
def test_supported_file_types(tmp_path, file_type):
    evidence = make_evidence(
        tmp_path,
        filename=f"recording.{file_type}",
    )

    result = make_extractor().extract(evidence)

    assert result.file_type == file_type


def test_reject_unsupported_file_type(tmp_path):
    evidence = make_evidence(
        tmp_path,
        filename="notes.txt",
    )

    with pytest.raises(AudioExtractionError):
        make_extractor().extract(evidence)


def test_reject_excessive_audio_duration(tmp_path):
    evidence = make_evidence(tmp_path)

    probe = FakeAudioProbe(duration_seconds=1200)
    transcriber = FakeSpeechTranscriber()

    extractor = make_extractor(
        audio_probe=probe,
        speech_transcriber=transcriber,
        max_duration_seconds=600,
    )

    with pytest.raises(AudioExtractionLimitError):
        extractor.extract(evidence)

    assert transcriber.call_count == 0


def test_reject_oversized_file(tmp_path):
    evidence = make_evidence(tmp_path, file_size=200)

    probe = FakeAudioProbe()

    extractor = make_extractor(
        audio_probe=probe,
        max_file_bytes=100,
    )

    with pytest.raises(AudioExtractionLimitError):
        extractor.extract(evidence)

    assert probe.call_count == 0


def test_reject_excessive_segments(tmp_path):
    evidence = make_evidence(tmp_path)

    extractor = make_extractor(max_segments=1)

    with pytest.raises(AudioExtractionLimitError):
        extractor.extract(evidence)


def test_reject_excessive_transcript_characters(tmp_path):
    evidence = make_evidence(tmp_path)

    extractor = make_extractor(max_extracted_characters=5)

    with pytest.raises(AudioExtractionLimitError):
        extractor.extract(evidence)


def test_reject_invalid_segment_timestamps(tmp_path):
    evidence = make_evidence(tmp_path)

    transcriber = FakeSpeechTranscriber(
        segments=(
            SpeechSegment(
                start_seconds=8.0,
                end_seconds=3.0,
                text="Invalid segment",
            ),
        )
    )

    extractor = make_extractor(speech_transcriber=transcriber)

    with pytest.raises(AudioExtractionError):
        extractor.extract(evidence)


def test_original_evidence_unchanged(tmp_path):
    evidence = make_evidence(tmp_path)

    original_bytes = evidence.descriptor.path.read_bytes()

    make_extractor().extract(evidence)

    assert evidence.descriptor.path.read_bytes() == original_bytes


@pytest.mark.parametrize(
    "configuration",
    [
        {"max_file_bytes": 0},
        {"max_duration_seconds": -1},
        {"max_segments": 0},
        {"max_extracted_characters": -1},
    ],
)
def test_invalid_configuration(configuration):
    with pytest.raises(ValueError):
        make_extractor(**configuration)
