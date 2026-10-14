"""Convert speech into timestamped text"""

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from app.core.exceptions import AudioExtractionError, AudioExtractionLimitError


@dataclass(frozen=True)
class SpeechSegment:
    """One recognized segment of speech."""

    start_seconds: float
    end_seconds: float
    text: str


@dataclass(frozen=True)
class TranscriptionResult:
    """Complete speech recognition result."""

    language: str | None
    segments: tuple[SpeechSegment, ...]


class SpeechTranscriber(Protocol):
    """Contract for converting audio into text."""

    def transcribe(self, path: Path) -> TranscriptionResult:
        """Return timestamped recognized speech."""
        ...


class FasterWhisperTranscriber:
    """Local speech transcription powered by Faster-Whisper."""

    def __init__(
        self,
        model_name: str = "small",
        device: str = "cpu",
        compute_type: str = "int8",
        language: str | None = None,
        max_segments: int = 5_000,
        max_characters: int = 500_000,
    ) -> None:
        if not model_name:
            raise ValueError("Model name must not be empty")

        if max_segments <= 0 or max_characters <= 0:
            raise ValueError("Transcription limits must be positive")

        self._model_name = model_name
        self._device = device
        self._compute_type = compute_type
        self._language = language
        self._max_segments = max_segments
        self._max_characters = max_characters
        self._model = None

    def _get_model(self):
        """Load the speech recognition model on first use."""

        if self._model is None:
            from faster_whisper import WhisperModel

            self._model = WhisperModel(
                self._model_name,
                device=self._device,
                compute_type=self._compute_type,
            )

        return self._model

    def transcribe(self, path: Path) -> TranscriptionResult:
        """Transcribe audio and enforce output limits as segments arrive."""

        try:
            model = self._get_model()

            segments, info = model.transcribe(
                str(path),
                language=self._language,
                beam_size=5,
                task="transcribe",
                vad_filter=False,
                word_timestamps=False,
            )

            recognized_segments: list[SpeechSegment] = []
            total_characters = 0

            for segment in segments:
                if len(recognized_segments) >= self._max_segments:
                    raise AudioExtractionLimitError(
                        "Audio exceeds the transcription segment limit"
                    )

                text = segment.text

                total_characters += len(text)

                if total_characters > self._max_characters:
                    raise AudioExtractionLimitError(
                        "Audio exceeds the transcription text limit"
                    )

                start_seconds = float(segment.start)
                end_seconds = float(segment.end)

                if (
                    not math.isfinite(start_seconds)
                    or not math.isfinite(end_seconds)
                    or start_seconds < 0
                    or end_seconds < start_seconds
                ):
                    raise AudioExtractionError(
                        "Speech recognition returned invalid timestamps"
                    )

                recognized_segments.append(
                    SpeechSegment(
                        start_seconds=start_seconds,
                        end_seconds=end_seconds,
                        text=text,
                    )
                )

            return TranscriptionResult(
                language=info.language,
                segments=tuple(recognized_segments),
            )

        except AudioExtractionError:
            raise
        except Exception as exc:
            raise AudioExtractionError("Speech recognition failed") from exc
