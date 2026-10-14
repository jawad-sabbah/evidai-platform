import wave

import pytest

from app.core.exceptions import AudioExtractionError
from app.services.evidence_processing.extractors.audio.audio_probe import (
    PyAvAudioProbe,
)


def create_wav(path, duration_seconds=2, sample_rate=16000):
    frame_count = duration_seconds * sample_rate

    with wave.open(str(path), "wb") as audio_file:
        audio_file.setnchannels(1)
        audio_file.setsampwidth(2)
        audio_file.setframerate(sample_rate)
        audio_file.writeframes(b"\x00\x00" * frame_count)


def test_inspect_wav_metadata(tmp_path):
    path = tmp_path / "recording.wav"
    create_wav(path, duration_seconds=2)

    result = PyAvAudioProbe().inspect(path)

    assert result.duration_seconds == pytest.approx(2.0)
    assert result.sample_rate == 16000


def test_reject_file_without_audio_stream(tmp_path):
    path = tmp_path / "empty.wav"
    path.write_bytes(b"Not a valid audio recording")

    with pytest.raises(AudioExtractionError):
        PyAvAudioProbe().inspect(path)


def test_reject_missing_audio_file(tmp_path):
    path = tmp_path / "missing.wav"

    with pytest.raises(AudioExtractionError):
        PyAvAudioProbe().inspect(path)
