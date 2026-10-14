import math

from app.core.exceptions import (
    AudioExtractionError,
    AudioExtractionLimitError,
)
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.audio.audio_probe import (
    AudioProbe,
)
from app.services.evidence_processing.extractors.audio.speech_transcriber import (
    SpeechTranscriber,
)
from app.services.evidence_processing.extractors.base import EvidenceExtractor


class AudioEvidenceExtractor(EvidenceExtractor):
    """Extract source-attributed speech from validated audio evidence."""

    SUPPORTED_FILE_TYPES = frozenset({"wav", "mp3", "m4a", "flac"})

    EXTRACTOR_NAME = "AudioEvidenceExtractor"

    def __init__(
        self,
        audio_probe: AudioProbe,
        speech_transcriber: SpeechTranscriber,
        max_file_bytes: int = 25 * 1024 * 1024,
        max_duration_seconds: float = 600.0,
        max_segments: int = 5_000,
        max_extracted_characters: int = 500_000,
    ) -> None:
        if (
            max_file_bytes <= 0
            or not math.isfinite(max_duration_seconds)
            or max_duration_seconds <= 0
            or max_segments <= 0
            or max_extracted_characters <= 0
        ):
            raise ValueError("Audio extraction limits must be positive")

        self._audio_probe = audio_probe
        self._speech_transcriber = speech_transcriber
        self._max_file_bytes = max_file_bytes
        self._max_duration_seconds = max_duration_seconds
        self._max_segments = max_segments
        self._max_extracted_characters = max_extracted_characters

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        """Validate, transcribe and build timestamped evidence blocks."""

        file_type = evidence_file.detected_file_type.lower()

        if file_type not in self.SUPPORTED_FILE_TYPES:
            raise AudioExtractionError(
                f"Unsupported audio evidence format: {file_type}"
            )

        descriptor = evidence_file.descriptor

        if descriptor.file_size < 0 or descriptor.file_size > self._max_file_bytes:
            raise AudioExtractionLimitError(
                "Audio evidence exceeds the file size limit"
            )

        try:
            actual_file_size = descriptor.path.stat().st_size
        except OSError as exc:
            raise AudioExtractionError(
                "Unable to read audio evidence metadata"
            ) from exc

        if actual_file_size > self._max_file_bytes:
            raise AudioExtractionLimitError(
                "Audio evidence exceeds the file size limit"
            )

        audio_info = self._audio_probe.inspect(descriptor.path)

        if (
            not math.isfinite(audio_info.duration_seconds)
            or audio_info.duration_seconds <= 0
        ):
            raise AudioExtractionError("Audio duration is invalid")

        if audio_info.duration_seconds > self._max_duration_seconds:
            raise AudioExtractionLimitError(
                "Audio recording exceeds the duration limit"
            )

        transcription = self._speech_transcriber.transcribe(descriptor.path)

        if len(transcription.segments) > self._max_segments:
            raise AudioExtractionLimitError(
                "Audio transcript exceeds the segment limit"
            )

        blocks: list[ExtractedContentBlock] = []
        total_characters = 0

        for segment_number, segment in enumerate(
            transcription.segments,
            start=1,
        ):
            self._validate_segment(
                segment.start_seconds,
                segment.end_seconds,
                audio_info.duration_seconds,
            )

            total_characters += len(segment.text)

            if total_characters > self._max_extracted_characters:
                raise AudioExtractionLimitError(
                    "Audio transcript exceeds the character limit"
                )

            blocks.append(
                ExtractedContentBlock(
                    text=segment.text,
                    content_type="audio_transcript_segment",
                    source_reference=SourceReference(
                        start_time_seconds=segment.start_seconds,
                        end_time_seconds=segment.end_seconds,
                    ),
                    metadata={
                        "segment_number": segment_number,
                        "language": transcription.language,
                        "requires_review": True,
                        "extraction_method": "speech_recognition",
                    },
                )
            )

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type=file_type,
            extractor_name=self.EXTRACTOR_NAME,
            blocks=tuple(blocks),
            metadata={
                "duration_seconds": audio_info.duration_seconds,
                "sample_rate": audio_info.sample_rate,
                "detected_language": transcription.language,
                "segment_count": len(blocks),
                "extracted_character_count": total_characters,
                "transcription_method": "automatic_speech_recognition",
            },
        )

    @staticmethod
    def _validate_segment(
        start_seconds: float,
        end_seconds: float,
        duration_seconds: float,
    ) -> None:
        """Reject invalid or impossible speech segment timestamps."""

        if (
            not math.isfinite(start_seconds)
            or not math.isfinite(end_seconds)
            or start_seconds < 0
            or end_seconds < start_seconds
            or end_seconds > duration_seconds + 1.0
        ):
            raise AudioExtractionError("Transcript contains invalid segment timestamps")
