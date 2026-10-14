import math
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import av

from app.core.exceptions import AudioExtractionError

"""" Inspect audio duration and sample rate """


@dataclass(frozen=True)
class AudioInfo:
    """Basic information about an audio recording."""

    duration_seconds: float
    sample_rate: int | None


class AudioProbe(Protocol):
    """Contract for inspecting audio evidence."""

    def inspect(self, path: Path) -> AudioInfo:
        """Return the recording's duration and sample rate."""
        ...


class PyAvAudioProbe:
    """Inspect audio metadata using PyAV."""

    def inspect(self, path: Path) -> AudioInfo:
        try:
            with av.open(str(path)) as container:
                audio_stream = next(
                    (stream for stream in container.streams if stream.type == "audio"),
                    None,
                )

                if audio_stream is None:
                    raise AudioExtractionError(
                        "Evidence does not contain an audio stream"
                    )

                duration_seconds = self._get_duration_seconds(
                    audio_stream,
                    container,
                )

                if (
                    duration_seconds is None
                    or not math.isfinite(duration_seconds)
                    or duration_seconds <= 0
                ):
                    raise AudioExtractionError(
                        "Audio duration is unavailable or invalid"
                    )

                return AudioInfo(
                    duration_seconds=duration_seconds,
                    sample_rate=audio_stream.codec_context.sample_rate,
                )

        except AudioExtractionError:
            raise
        except (av.FFmpegError, OSError, ValueError) as exc:
            raise AudioExtractionError("Unable to inspect audio evidence") from exc

    @staticmethod
    def _get_duration_seconds(
        audio_stream: av.audio.stream.AudioStream,
        container: av.container.InputContainer,
    ) -> float | None:
        """Prefer stream duration, falling back to container duration."""

        if audio_stream.duration is not None and audio_stream.time_base is not None:
            return float(audio_stream.duration * audio_stream.time_base)

        if container.duration is not None:
            return container.duration / av.time_base

        return None
