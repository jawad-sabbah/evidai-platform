from zipfile import BadZipFile

from docx import Document
from docx.opc.exceptions import PackageNotFoundError
from docx.table import Table
from docx.text.paragraph import Paragraph
from lxml.etree import XMLSyntaxError

from app.core.exceptions import (
    DocxExtractionError,
    DocxExtractionLimitError,
)
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.base import EvidenceExtractor


class DocxTextExtractor(EvidenceExtractor):
    """Extract ordered paragraphs and table rows from Word documents."""

    EXTRACTOR_NAME = "python-docx"

    def __init__(
        self,
        max_blocks: int = 10_000,
        max_extracted_characters: int = 2_000_000,
    ) -> None:
        if max_blocks <= 0:
            raise ValueError("Maximum blocks must be positive")

        if max_extracted_characters <= 0:
            raise ValueError("Maximum extracted characters must be positive")

        self.max_blocks = max_blocks
        self.max_extracted_characters = max_extracted_characters

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        """Extract DOCX content with document-order source references."""

        if evidence_file.detected_file_type != "docx":
            raise DocxExtractionError(
                "DOCX extractor received a non-DOCX evidence file"
            )

        descriptor = evidence_file.descriptor
        blocks: list[ExtractedContentBlock] = []
        total_characters = 0
        paragraph_count = 0
        table_count = 0
        table_row_count = 0

        try:
            with descriptor.open() as source:
                document = Document(source)

                for item in document.iter_inner_content():
                    if isinstance(item, Paragraph):
                        paragraph_count += 1
                        block = self._extract_paragraph(
                            item,
                            paragraph_count,
                        )
                        new_blocks = [block] if block is not None else []

                    elif isinstance(item, Table):
                        table_count += 1
                        new_blocks = self._extract_table(
                            item,
                            table_count,
                        )
                        table_row_count += len(new_blocks)

                    else:
                        continue

                    for block in new_blocks:
                        if len(blocks) >= self.max_blocks:
                            raise DocxExtractionLimitError(
                                "DOCX exceeds the maximum content block count"
                            )

                        total_characters += len(block.text)

                        if total_characters > self.max_extracted_characters:
                            raise DocxExtractionLimitError(
                                "DOCX exceeds the extracted text limit"
                            )

                        blocks.append(block)

        except DocxExtractionError:
            raise
        except (
            BadZipFile,
            PackageNotFoundError,
            XMLSyntaxError,
            OSError,
            KeyError,
            ValueError,
            RecursionError,
        ) as exc:
            raise DocxExtractionError(
                "Unable to extract Word document content"
            ) from exc

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="docx",
            extractor_name=self.EXTRACTOR_NAME,
            blocks=tuple(blocks),
            metadata={
                "paragraph_count": paragraph_count,
                "table_count": table_count,
                "table_row_count": table_row_count,
                "extracted_block_count": len(blocks),
                "extracted_character_count": total_characters,
            },
        )

    @staticmethod
    def _extract_paragraph(
        paragraph: Paragraph,
        paragraph_number: int,
    ) -> ExtractedContentBlock | None:
        """Convert a non-empty Word paragraph into an extraction block."""

        if not paragraph.text.strip():
            return None

        style_name = paragraph.style.name if paragraph.style else None

        is_heading = style_name is not None and style_name.lower().startswith("heading")

        return ExtractedContentBlock(
            text=paragraph.text,
            content_type="heading" if is_heading else "paragraph",
            source_reference=SourceReference(),
            metadata={
                "paragraph_number": paragraph_number,
                "style": style_name,
            },
        )

    @staticmethod
    def _extract_table(
        table: Table,
        table_number: int,
    ) -> list[ExtractedContentBlock]:
        """Extract Word table rows while preserving cell boundaries."""

        blocks = []

        for row_number, row in enumerate(table.rows, start=1):
            cell_values = tuple(cell.text for cell in row.cells)

            blocks.append(
                ExtractedContentBlock(
                    text="\t".join(cell_values),
                    content_type="table_row",
                    source_reference=SourceReference(
                        row_number=row_number,
                    ),
                    metadata={
                        "table_number": table_number,
                        "cells": cell_values,
                    },
                )
            )

        return blocks
