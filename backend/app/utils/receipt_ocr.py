from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from statistics import mean
from pathlib import Path

from flask import current_app
from PIL import Image, ImageFilter, ImageOps


class ReceiptOCRError(RuntimeError):
    pass


@dataclass(frozen=True)
class OCRResult:
    text: str
    confidence: float


ALLOWED_RECEIPT_EXTENSIONS = {"jpg", "jpeg", "png"}

WINDOWS_TESSERACT_CANDIDATES = (
    r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
    r"C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",
)


def is_allowed_receipt_file(filename: str) -> bool:
    if not filename or "." not in filename:
        return False
    return filename.rsplit(".", 1)[1].lower() in ALLOWED_RECEIPT_EXTENSIONS


def load_and_preprocess_receipt_image(image_path: str):
    try:
        with Image.open(image_path) as image:
            image = image.convert("RGB")
            image = ImageOps.exif_transpose(image)
            grayscale = ImageOps.grayscale(image)
            normalized = ImageOps.autocontrast(grayscale)
            if min(normalized.size) < 900:
                scale = max(1, 900 // min(normalized.size))
                normalized = normalized.resize(
                    (normalized.size[0] * scale, normalized.size[1] * scale),
                    Image.Resampling.LANCZOS,
                )
            return normalized.filter(ImageFilter.SHARPEN)
    except ReceiptOCRError:
        raise
    except Exception as exc:
        raise ReceiptOCRError("The receipt image could not be opened.") from exc


def _configure_tesseract_binary(pytesseract):
    configured_path = str(getattr(current_app, "config", {}).get("TESSERACT_CMD", "") or "").strip()
    if configured_path and Path(configured_path).exists():
        pytesseract.pytesseract.tesseract_cmd = configured_path
        return configured_path

    env_path = os.getenv("TESSERACT_CMD", "").strip()
    if env_path and Path(env_path).exists():
        pytesseract.pytesseract.tesseract_cmd = env_path
        return env_path

    resolved = shutil.which("tesseract")
    if resolved:
        pytesseract.pytesseract.tesseract_cmd = resolved
        return resolved

    for candidate in WINDOWS_TESSERACT_CANDIDATES:
        if Path(candidate).exists():
            pytesseract.pytesseract.tesseract_cmd = candidate
            return candidate

    return None


def extract_text_with_tesseract(image_path: str, *, min_confidence: float = 45.0) -> OCRResult:
    try:
        import pytesseract
    except ImportError as exc:
        raise ReceiptOCRError("pytesseract is not installed.") from exc

    try:
        binary_path = _configure_tesseract_binary(pytesseract)
        if not binary_path:
            raise ReceiptOCRError(
                "Tesseract OCR is not installed or not available on PATH. "
                "Set TESSERACT_CMD to the full path of tesseract.exe, for example "
                "C:\\Program Files\\Tesseract-OCR\\tesseract.exe."
            )
        image = load_and_preprocess_receipt_image(image_path)
        data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT,
            config="--oem 3 --psm 6",
            lang="eng",
        )
    except pytesseract.TesseractNotFoundError as exc:
        raise ReceiptOCRError("Tesseract OCR is not installed or not available on PATH.") from exc
    except Exception as exc:
        raise ReceiptOCRError("Receipt OCR failed during text extraction.") from exc

    words = []
    confidences = []
    for text, conf in zip(data.get("text", []), data.get("conf", [])):
        cleaned = (text or "").strip()
        if not cleaned:
            continue
        try:
            confidence = float(conf)
        except (TypeError, ValueError):
            confidence = -1.0
        if confidence > 0:
            confidences.append(confidence)
        words.append(cleaned)

    raw_text = " ".join(words).strip()
    average_confidence = mean(confidences) if confidences else 0.0

    if not raw_text or average_confidence < min_confidence:
        raise ReceiptOCRError("The receipt image appears blurry or unreadable. Please upload a clearer image.")

    return OCRResult(text=raw_text, confidence=round(average_confidence, 2))