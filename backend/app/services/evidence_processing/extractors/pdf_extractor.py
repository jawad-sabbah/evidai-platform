from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.core.exceptions import (
    EncryptedEvidencePdfError,
    PdfExtractionError,
    PdfExtractionLimitError,
)
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.base import (
    EvidenceExtractor,
)


class PdfTextExtractor(EvidenceExtractor):
    """Extract page-attributed text from digital PDF documents."""

    EXTRACTOR_NAME = "pypdf"

    def __init__(
        self,
        max_pages: int = 200,
        max_extracted_characters: int = 2_000_000,
    ) -> None:
        if max_pages <= 0:
            raise ValueError("Maximum PDF pages must be positive")

        if max_extracted_characters <= 0:
            raise ValueError("Maximum extracted characters must be positive")

        self.max_pages = max_pages
        self.max_extracted_characters = max_extracted_characters

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        """Extract text while preserving page numbers and evidence identity."""

        if evidence_file.detected_file_type != "pdf":
            raise PdfExtractionError("PDF extractor received a non-PDF evidence file")

        descriptor = evidence_file.descriptor

        try:
            with descriptor.open() as file:
                reader = PdfReader(file, strict=True)

                if reader.is_encrypted:
                    raise EncryptedEvidencePdfError(
                        "Encrypted PDF files require decryption"
                    )

                page_count = len(reader.pages)

                if page_count == 0:
                    raise PdfExtractionError("PDF document contains no pages")

                if page_count > self.max_pages:
                    raise PdfExtractionLimitError(
                        "PDF exceeds the maximum allowed page count"
                    )

                blocks = []
                pages_without_text = []
                total_characters = 0

                for page_number, page in enumerate(
                    reader.pages,
                    start=1,
                ):
                    extracted_text = page.extract_text() or ""

                    total_characters += len(extracted_text)

                    if total_characters > self.max_extracted_characters:
                        raise PdfExtractionLimitError(
                            "PDF exceeds the maximum extracted text limit"
                        )

                    requires_ocr = not extracted_text.strip()

                    if requires_ocr:
                        pages_without_text.append(page_number)

                    blocks.append(
                        ExtractedContentBlock(
                            text=extracted_text,
                            content_type="page",
                            source_reference=SourceReference(page_number=page_number),
                            metadata={
                                "requires_ocr": requires_ocr,
                                "extraction_method": "digital_text",
                            },
                        )
                    )

        except PdfExtractionError:
            raise
        except (
            PdfReadError,
            OSError,
            ValueError,
            TypeError,
            RecursionError,
        ) as exc:
            raise PdfExtractionError("Unable to extract PDF document content") from exc

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="pdf",
            extractor_name=self.EXTRACTOR_NAME,
            blocks=tuple(blocks),
            metadata={
                "page_count": page_count,
                "pages_without_text": tuple(pages_without_text),
                "ocr_recommended": bool(pages_without_text),
                "extracted_character_count": total_characters,
            },
        )
