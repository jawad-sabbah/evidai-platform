import hashlib
import wave

from PIL import Image

from app.services.evidence_processing.extraction_metadata_service import (
    ExtractionMetadataService,
)
from app.services.evidence_processing.extractors.audio.audio_extractor import (
    AudioEvidenceExtractor,
)
from app.services.evidence_processing.extractors.audio.audio_probe import (
    PyAvAudioProbe,
)
from app.services.evidence_processing.extractors.audio.speech_transcriber import (
    SpeechSegment,
    TranscriptionResult,
)
from app.services.evidence_processing.extractors.factory import (
    EvidenceExtractorFactory,
)
from app.services.evidence_processing.extractors.image_ocr_extractor import (
    ImageOcrExtractor,
)


class FakeOcrEngine:
    def recognize(self, image):
        assert image.width > 0
        assert image.height > 0
        return "Invoice amount 5000"


class FakeSpeechTranscriber:
    def transcribe(self, path):
        assert path.exists()

        return TranscriptionResult(
            language="en",
            segments=(
                SpeechSegment(
                    start_seconds=0.0,
                    end_seconds=0.5,
                    text="The invoice was paid.",
                ),
            ),
        )


def create_wav_bytes(tmp_path):
    path = tmp_path / "audio_source.wav"

    with wave.open(str(path), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(16000)
        audio.writeframes(b"\x00\x00" * 16000)

    return path.read_bytes()


def test_image_ocr_pipeline(
    tmp_path,
    evidence_builder,
    validated_snapshot,
):
    image_path = tmp_path / "image_source.png"

    with Image.new("RGB", (300, 100), "white") as image:
        image.save(image_path)

    image_bytes = image_path.read_bytes()

    descriptor = evidence_builder(
        "invoice.png",
        image_bytes,
    )

    factory = EvidenceExtractorFactory(
        extractors={
            "png": ImageOcrExtractor(FakeOcrEngine()),
        }
    )

    with validated_snapshot(descriptor) as evidence_file:
        extractor = factory.get_extractor("png")
        extracted = extractor.extract(evidence_file)

        result = ExtractionMetadataService().enrich(
            evidence_file,
            extracted,
        )

        assert result.blocks[0].text == "Invoice amount 5000"
        assert result.blocks[0].metadata["requires_review"] is True
        assert result.provenance.source_checksum_sha256 == (
            hashlib.sha256(image_bytes).hexdigest()
        )


def test_audio_transcription_pipeline(
    tmp_path,
    evidence_builder,
    validated_snapshot,
):
    audio_bytes = create_wav_bytes(tmp_path)

    descriptor = evidence_builder(
        "interview.wav",
        audio_bytes,
    )

    audio_extractor = AudioEvidenceExtractor(
        audio_probe=PyAvAudioProbe(),
        speech_transcriber=FakeSpeechTranscriber(),
    )

    factory = EvidenceExtractorFactory(
        extractors={
            "wav": audio_extractor,
        }
    )

    with validated_snapshot(descriptor) as evidence_file:
        extractor = factory.get_extractor("wav")
        extracted = extractor.extract(evidence_file)

        result = ExtractionMetadataService().enrich(
            evidence_file,
            extracted,
        )

        assert result.blocks[0].text == "The invoice was paid."

        reference = result.blocks[0].source_reference

        assert reference.start_time_seconds == 0.0
        assert reference.end_time_seconds == 0.5
        assert reference.block_number == 1

        assert result.metadata["duration_seconds"] == 1.0
        assert result.provenance.source_size_bytes == len(audio_bytes)
