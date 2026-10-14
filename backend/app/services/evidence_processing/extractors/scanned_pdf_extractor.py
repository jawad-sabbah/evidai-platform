from math import ceil

import pymupdf
from PIL import Image

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


class ScannedPdfOcrExtractor(EvidenceExtractor):
    """OCR PDF pages while preserving page-level provenance."""

    def __init__(
        self,
        ocr_engine: OcrEngine,
        dpi: int = 150,
        max_pages: int = 50,
        max_pixels_per_page: int = 20_000_000,
        max_pdf_bytes: int = 25 * 1024 * 1024,
    ) -> None:
        if not 72 <= dpi <= 300:
            raise ValueError("OCR DPI must be between 72 and 300")

        if min(max_pages, max_pixels_per_page, max_pdf_bytes) <= 0:
            raise ValueError("OCR limits must be positive")

        self._ocr_engine = ocr_engine
        self._dpi = dpi
        self._max_pages = max_pages
        self._max_pixels_per_page = max_pixels_per_page
        self._max_pdf_bytes = max_pdf_bytes

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        if evidence_file.detected_file_type != "pdf":
            raise EvidenceOcrError("Scanned PDF extractor received a non-PDF file")

        descriptor = evidence_file.descriptor

        try:
            with descriptor.open() as source:
                pdf_bytes = source.read(self._max_pdf_bytes + 1)

            if len(pdf_bytes) > self._max_pdf_bytes:
                raise EvidenceOcrLimitError("PDF exceeds the OCR input size limit")

            with pymupdf.open(
                stream=pdf_bytes,
                filetype="pdf",
            ) as document:
                if document.needs_pass:
                    raise EvidenceOcrError("Encrypted PDFs are not supported for OCR")

                if document.page_count == 0:
                    raise EvidenceOcrError("PDF contains no pages")

                if document.page_count > self._max_pages:
                    raise EvidenceOcrLimitError("PDF exceeds the OCR page limit")

                blocks = []

                for page_number, page in enumerate(document, start=1):
                    self._check_page_dimensions(page)

                    pixmap = page.get_pixmap(
                        dpi=self._dpi,
                        colorspace=pymupdf.csRGB,
                        alpha=False,
                    )

                    if pixmap.width * pixmap.height > self._max_pixels_per_page:
                        raise EvidenceOcrLimitError(
                            "Rendered PDF page exceeds the pixel limit"
                        )

                    with Image.frombytes(
                        "RGB",
                        (pixmap.width, pixmap.height),
                        pixmap.samples,
                    ) as image:
                        text = self._ocr_engine.recognize(image)

                    blocks.append(
                        ExtractedContentBlock(
                            text=text,
                            content_type="ocr_page",
                            source_reference=SourceReference(page_number=page_number),
                            metadata={
                                "extraction_method": "ocr",
                                "requires_review": True,
                            },
                        )
                    )

        except EvidenceOcrError:
            raise
        except (
            pymupdf.FileDataError,
            pymupdf.EmptyFileError,
            OSError,
            ValueError,
            RuntimeError,
        ) as exc:
            raise EvidenceOcrError("Unable to OCR scanned PDF evidence") from exc

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="pdf",
            extractor_name="ScannedPdfOcrExtractor",
            blocks=tuple(blocks),
            metadata={
                "ocr_applied": True,
                "page_count": len(blocks),
                "dpi": self._dpi,
            },
        )

    def _check_page_dimensions(self, page: pymupdf.Page) -> None:
        """Check expected render size before allocating pixel memory."""

        scale = self._dpi / 72

        estimated_width = ceil(page.rect.width * scale)
        estimated_height = ceil(page.rect.height * scale)

        if estimated_width * estimated_height > self._max_pixels_per_page:
            raise EvidenceOcrLimitError("PDF page exceeds the render pixel limit")
