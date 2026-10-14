import warnings

from PIL import Image, UnidentifiedImageError

from app.core.exceptions import EvidenceOcrError, EvidenceOcrLimitError
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.base import EvidenceExtractor
from app.services.evidence_processing.extractors.ocr_engine import OcrEngine


class ImageOcrExtractor(EvidenceExtractor):
    """Extract printed text from a validated image evidence file."""

    SUPPORTED_TYPES = frozenset({"png", "jpg", "jpeg"})

    def __init__(
        self,
        ocr_engine: OcrEngine,
        max_pixels: int = 20_000_000,
    ) -> None:
        if max_pixels <= 0:
            raise ValueError("Maximum image pixels must be positive")

        self._ocr_engine = ocr_engine
        self._max_pixels = max_pixels

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        file_type = evidence_file.detected_file_type.lower()

        if file_type not in self.SUPPORTED_TYPES:
            raise EvidenceOcrError("Image OCR received an unsupported evidence format")

        descriptor = evidence_file.descriptor

        try:
            with descriptor.open() as source, warnings.catch_warnings():
                warnings.simplefilter(
                    "error",
                    Image.DecompressionBombWarning,
                )

                with Image.open(source) as image:
                    if image.width * image.height > self._max_pixels:
                        raise EvidenceOcrLimitError("Image exceeds the pixel limit")

                    image.load()
                    with image.convert("RGB") as rgb_image:
                        text = self._ocr_engine.recognize(rgb_image)

        except EvidenceOcrError:
            raise
        except (
            OSError,
            ValueError,
            UnidentifiedImageError,
            Image.DecompressionBombError,
            Image.DecompressionBombWarning,
        ) as exc:
            raise EvidenceOcrError("Unable to process image evidence") from exc

        block = ExtractedContentBlock(
            text=text,
            content_type="ocr_text",
            source_reference=SourceReference(page_number=1),
            metadata={
                "extraction_method": "ocr",
                "requires_review": True,
            },
        )

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type=file_type,
            extractor_name="ImageOcrExtractor",
            blocks=(block,),
            metadata={
                "ocr_applied": True,
                "extracted_character_count": len(text),
            },
        )
