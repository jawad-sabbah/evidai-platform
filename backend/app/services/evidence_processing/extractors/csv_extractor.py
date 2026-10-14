import csv
import io

from app.core.exceptions import TextExtractionError
from app.services.evidence_processing.dto.extraction_result import (
    ExtractedContentBlock,
    ExtractionResult,
    SourceReference,
)
from app.services.evidence_processing.dto.validated_file import (
    ValidatedEvidenceFile,
)
from app.services.evidence_processing.extractors.base import EvidenceExtractor
from app.services.evidence_processing.extractors.text_support import (
    read_evidence_text,
)


class CsvExtractor(EvidenceExtractor):
    """Extract CSV records while preserving original cell values."""

    def extract(
        self,
        evidence_file: ValidatedEvidenceFile,
    ) -> ExtractionResult:
        text = read_evidence_text(evidence_file, expected_type="csv")

        blocks = []

        try:
            reader = csv.reader(
                io.StringIO(text, newline=""),
                strict=True,
            )

            for record_number, cells in enumerate(reader, start=1):
                blocks.append(
                    ExtractedContentBlock(
                        text="\t".join(cells),
                        content_type="csv_row",
                        source_reference=SourceReference(row_number=record_number),
                        metadata={
                            "cells": tuple(cells),
                            "record_number": record_number,
                            "ending_line_number": reader.line_num,
                        },
                    )
                )

        except csv.Error as exc:
            raise TextExtractionError("Unable to parse CSV evidence") from exc

        descriptor = evidence_file.descriptor

        return ExtractionResult(
            evidence_id=descriptor.evidence_id,
            case_id=descriptor.case_id,
            file_type="csv",
            extractor_name="CsvExtractor",
            blocks=tuple(blocks),
            metadata={
                "row_count": len(blocks),
                "encoding": "utf-8",
                "delimiter": ",",
            },
        )
