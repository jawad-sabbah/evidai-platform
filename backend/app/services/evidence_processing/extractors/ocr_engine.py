from typing import Protocol

import pytesseract
from PIL import Image

from app.core.exceptions import EvidenceOcrError, EvidenceOcrLimitError


class OcrEngine(Protocol):
    """Minimal contract for an OCR engine."""

    def recognize(self, image: Image.Image) -> str:
        """Recognize text in an image."""


class TesseractOcrEngine:
    """OCR adapter that isolates pytesseract from extractors."""

    def __init__(
        self,
        language: str = "eng",
        timeout_seconds: int = 30,
        max_characters: int = 100_000,
    ) -> None:
        if not language:
            raise ValueError("OCR language must not be empty")
        if timeout_seconds <= 0 or max_characters <= 0:
            raise ValueError("OCR limits must be positive")

        self._language = language
        self._timeout_seconds = timeout_seconds
        self._max_characters = max_characters

    def recognize(self, image: Image.Image) -> str:
        try:
            text = pytesseract.image_to_string(
                image,
                lang=self._language,
                timeout=self._timeout_seconds,
            )
        except (RuntimeError, pytesseract.TesseractError) as exc:
            raise EvidenceOcrError(
                "OCR engine failed or exceeded its time limit"
            ) from exc
        except pytesseract.TesseractNotFoundError as exc:
            raise EvidenceOcrError("Tesseract executable is not available") from exc

        if len(text) > self._max_characters:
            raise EvidenceOcrLimitError("OCR output exceeds the character limit")

        return text
