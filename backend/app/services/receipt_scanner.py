from __future__ import annotations

import json
import re
import shutil
import tempfile
import uuid
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from flask import current_app
from werkzeug.utils import secure_filename

from app.config import Config
from app.extensions import db
from app.models import Category, Transaction
from app.services.finance import ensure_default_categories, get_default_category_names
from app.utils.gemini import generate_json_with_gemini, generate_json_with_gemini_image, normalize_category_name
from app.utils.receipt_ocr import ReceiptOCRError, extract_text_with_tesseract, is_allowed_receipt_file
from app.utils.security import parse_decimal


class ReceiptScanError(RuntimeError):
    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


@dataclass(frozen=True)
class ReceiptParseResult:
    merchant: str
    amount: Decimal
    date: str
    category: str
    confidence: float
    provider: str
    raw_text: str
    raw_ai_response: str | None = None
    fallback_reason: str | None = None


def _clean_json_response(raw_text: str) -> str:
    cleaned = (raw_text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _parse_receipt_date(value):
    if not value:
        return None
    text = str(value).strip()
    candidate_formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%d %b %Y",
        "%d %B %Y",
        "%b %d, %Y",
        "%B %d, %Y",
    ]
    for fmt in candidate_formats:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def _extract_date_string(value):
    parsed = _parse_receipt_date(value)
    if parsed:
        return parsed.isoformat()
    return datetime.utcnow().date().isoformat()


def _fallback_parse_receipt_text(raw_text: str):
    normalized_text = (raw_text or "").strip()
    merchant = normalized_text.splitlines()[0].strip() if normalized_text else "Receipt"

    amount_match = re.findall(
        r"(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)",
        normalized_text,
        flags=re.IGNORECASE,
    )
    amount = parse_decimal(amount_match[-1].replace(",", "")) if amount_match else None

    date_patterns = [
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\b\d{2}/\d{2}/\d{4}\b",
        r"\b\d{2}-\d{2}-\d{4}\b",
    ]
    date_value = None
    for pattern in date_patterns:
        match = re.search(pattern, normalized_text)
        if match:
            date_value = match.group(0)
            break

    category_lookup = get_default_category_names()
    lower_text = normalized_text.lower()
    category = "Other"
    category_keywords = {
        "Food": ["restaurant", "pizza", "meal", "dinner", "lunch", "breakfast", "cafe", "food", "swiggy", "zomato"],
        "Travel": ["uber", "ola", "cab", "taxi", "fuel", "metro", "train", "bus", "flight"],
        "Shopping": ["mall", "store", "amazon", "flipkart", "purchase", "shopping"],
        "Bills": ["bill", "recharge", "electricity", "water", "gas", "internet"],
        "Health": ["pharmacy", "medical", "hospital", "doctor", "clinic"],
    }
    for candidate, keywords in category_keywords.items():
        if any(keyword in lower_text for keyword in keywords) and candidate in category_lookup:
            category = candidate
            break

    return {
        "merchant": merchant,
        "amount": amount,
        "date": _extract_date_string(date_value),
        "category": category,
        "confidence": 0.0,
        "provider": "rules",
        "fallback_reason": "Gemini parsing was unavailable or returned invalid JSON.",
    }


def build_receipt_extraction_prompt(*, raw_text: str, categories):
    categories_text = ", ".join(categories)
    return (
        "You extract structured receipt data from OCR text.\n"
        "Return ONLY valid JSON. Do not wrap the output in markdown, prose, or code fences.\n"
        "Use double quotes for every key and string value.\n"
        "If a field is missing, use null.\n"
        "The category must be one of the allowed categories below, or null if uncertain.\n"
        "Allowed categories: "
        f"{categories_text}\n\n"
        "Return this JSON shape exactly:\n"
        "{\n"
        '  "merchant": string|null,\n'
        '  "amount": number|null,\n'
        '  "date": string|null,\n'
        '  "category": string|null,\n'
        '  "confidence": number|null\n'
        "}\n\n"
        "OCR text:\n"
        f"{raw_text}\n"
    )


def _parse_gemini_payload(raw_text: str):
    cleaned = _clean_json_response(raw_text)
    if not cleaned:
        raise ValueError("Empty Gemini response.")
    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        try:
            from flask import current_app
            current_app.logger.warning("Gemini returned invalid JSON for receipt extraction; preview: %s", cleaned[:400])
        except Exception:
            pass
        raise ValueError(f"Invalid JSON from Gemini: {exc.msg} (line {exc.lineno} col {exc.colno})") from exc
    if not isinstance(payload, dict):
        raise ValueError("Gemini response was not a JSON object.")
    return payload


def _extract_receipt_payload_from_image(image_path: str, raw_text: str):
    categories = get_default_category_names()
    prompt = (
        "You extract structured receipt data directly from the attached receipt image.\n"
        "Return ONLY valid JSON. Do not wrap the output in markdown, prose, or code fences.\n"
        "Use double quotes for every key and string value.\n"
        "If a field is missing, use null.\n"
        "The category must be one of the allowed categories below, or null if uncertain.\n"
        "Allowed categories: "
        f"{', '.join(categories)}\n\n"
        "Return this JSON shape exactly:\n"
        "{\n"
        '  "merchant": string|null,\n'
        '  "amount": number|null,\n'
        '  "date": string|null,\n'
        '  "category": string|null,\n'
        '  "confidence": number|null\n'
        "}\n"
    )
    gemini_result = generate_json_with_gemini_image(
        prompt,
        image_path,
        api_key=Config.GEMINI_API_KEY,
        model_name=Config.GEMINI_MODEL,
        max_output_tokens=256,
    )
    try:
        payload = _parse_gemini_payload(gemini_result.text)
        parse_result = _normalize_receipt_parse(payload, raw_text)
        return ReceiptParseResult(
            merchant=parse_result.merchant,
            amount=parse_result.amount,
            date=parse_result.date,
            category=parse_result.category,
            confidence=parse_result.confidence,
            provider=parse_result.provider,
            raw_text=parse_result.raw_text,
            raw_ai_response=gemini_result.text,
        )
    except ValueError as exc:
        # Log and attempt a simpler rule-based fallback using whatever text we have
        try:
            from flask import current_app
            current_app.logger.info("Gemini image parse failed, falling back to rule parser: %s", str(exc))
            current_app.logger.debug("Gemini image raw response preview: %s", gemini_result.text[:800])
        except Exception:
            pass
        fallback = _fallback_parse_receipt_text(raw_text)
        return ReceiptParseResult(
            merchant=fallback["merchant"],
            amount=fallback["amount"],
            date=fallback["date"],
            category=fallback["category"],
            confidence=fallback.get("confidence", 0.0),
            provider=fallback.get("provider", "rules"),
            raw_text=raw_text,
            fallback_reason=f"Gemini image parse failed: {exc}",
            raw_ai_response=gemini_result.text,
        )
    return ReceiptParseResult(
        merchant=parse_result.merchant,
        amount=parse_result.amount,
        date=parse_result.date,
        category=parse_result.category,
        confidence=parse_result.confidence,
        provider=parse_result.provider,
        raw_text=parse_result.raw_text,
        raw_ai_response=gemini_result.text,
    )


def _normalize_receipt_parse(payload, raw_text: str):
    default_categories = get_default_category_names()
    merchant_value = payload.get("merchant")
    merchant = merchant_value.strip() if isinstance(merchant_value, str) else merchant_value
    if not merchant:
        merchant = _fallback_parse_receipt_text(raw_text)["merchant"]

    amount = parse_decimal(payload.get("amount"))
    if amount is None or amount <= 0:
        amount = _fallback_parse_receipt_text(raw_text)["amount"]
    if amount is None or amount <= 0:
        raise ReceiptScanError("Could not determine the receipt total amount.")

    date_value = payload.get("date")
    parsed_date = _parse_receipt_date(date_value)
    if not parsed_date:
        parsed_date = _parse_receipt_date(_fallback_parse_receipt_text(raw_text)["date"])
    if not parsed_date:
        parsed_date = datetime.utcnow().date()

    category_name = normalize_category_name(payload.get("category"), default_categories)
    if not category_name:
        category_name = _fallback_parse_receipt_text(raw_text)["category"]
    if category_name not in default_categories:
        category_name = "Other"

    confidence = payload.get("confidence")
    try:
        confidence = float(confidence) if confidence is not None else 0.0
    except (TypeError, ValueError):
        confidence = 0.0

    return ReceiptParseResult(
        merchant=str(merchant).strip() or "Receipt",
        amount=amount,
        date=parsed_date.isoformat(),
        category=category_name,
        confidence=round(confidence, 2),
        provider=Config.GEMINI_MODEL,
        raw_text=raw_text,
    )


def _choose_category(user_id: int, category_name: str):
    category = Category.query.filter_by(user_id=user_id, name=category_name).first()
    if category:
        return category
    return Category.query.filter_by(user_id=user_id, name="Other").first()


def _persist_transaction(user_id: int, parse_result: ReceiptParseResult, *, ocr_confidence: float):
    ensure_default_categories(user_id)
    category = _choose_category(user_id, parse_result.category)

    transaction = Transaction(
        user_id=user_id,
        category_id=category.id if category else None,
        title=parse_result.merchant,
        amount=parse_result.amount,
        transaction_type="expense",
        date=datetime.fromisoformat(parse_result.date).date(),
        notes=parse_result.raw_text,
        ai_category_name=parse_result.category,
        ai_category_confidence=parse_result.confidence or ocr_confidence,
        ai_category_source="gemini" if parse_result.provider != "rules" else "rules",
        ai_category_provider=parse_result.provider,
        ai_category_reason=parse_result.fallback_reason,
    )
    db.session.add(transaction)
    db.session.commit()
    return transaction


def scan_receipt_upload(upload_file, user_id: int):
    filename = secure_filename(upload_file.filename or "receipt")
    if not is_allowed_receipt_file(filename):
        raise ReceiptScanError("Only JPG, JPEG, and PNG receipt images are supported.")

    max_size = current_app.config.get("MAX_RECEIPT_UPLOAD_BYTES", Config.MAX_RECEIPT_UPLOAD_BYTES)
    temp_dir = tempfile.mkdtemp(prefix="rupeerocket_receipts_")
    temp_path = None
    ocr_confidence = 0.0

    try:
        temp_path = str(Path(temp_dir) / f"{uuid.uuid4().hex}_{filename}")
        upload_file.save(temp_path)

        file_size = Path(temp_path).stat().st_size
        if file_size <= 0:
            raise ReceiptScanError("The uploaded receipt file is empty.")
        if file_size > max_size:
            raise ReceiptScanError(f"Receipt image must be smaller than {Config.MAX_RECEIPT_UPLOAD_MB} MB.")

        try:
            ocr_result = extract_text_with_tesseract(
                temp_path,
                min_confidence=current_app.config.get("RECEIPT_OCR_MIN_CONFIDENCE", Config.RECEIPT_OCR_MIN_CONFIDENCE),
            )
            raw_text = ocr_result.text
            ocr_confidence = ocr_result.confidence

            categories = get_default_category_names()
            prompt = build_receipt_extraction_prompt(raw_text=raw_text, categories=categories)

            try:
                gemini_result = generate_json_with_gemini(
                    prompt,
                    api_key=Config.GEMINI_API_KEY,
                    model_name=Config.GEMINI_MODEL,
                    max_output_tokens=256,
                )
                payload = _parse_gemini_payload(gemini_result.text)
                parse_result = _normalize_receipt_parse(payload, raw_text)
                parse_result = ReceiptParseResult(
                    merchant=parse_result.merchant,
                    amount=parse_result.amount,
                    date=parse_result.date,
                    category=parse_result.category,
                    confidence=parse_result.confidence or ocr_result.confidence,
                    provider=parse_result.provider,
                    raw_text=parse_result.raw_text,
                    raw_ai_response=gemini_result.text,
                )
            except Exception:
                fallback_payload = _fallback_parse_receipt_text(raw_text)
                parse_result = ReceiptParseResult(
                    merchant=fallback_payload["merchant"],
                    amount=fallback_payload["amount"],
                    date=fallback_payload["date"],
                    category=fallback_payload["category"],
                    confidence=ocr_result.confidence,
                    provider=fallback_payload["provider"],
                    raw_text=raw_text,
                    fallback_reason=fallback_payload.get("fallback_reason"),
                )
        except ReceiptOCRError:
            if not Config.GEMINI_API_KEY:
                raise ReceiptScanError(
                    "Receipt OCR is unavailable on this machine. Set TESSERACT_CMD or configure GEMINI_API_KEY to enable image-based extraction."
                )
            try:
                parse_result = _extract_receipt_payload_from_image(temp_path, raw_text="")
                ocr_confidence = parse_result.confidence or 0.0
            except ReceiptScanError:
                raise
            except Exception as exc:
                raise ReceiptScanError(f"Receipt image extraction failed: {exc}") from exc

        transaction = _persist_transaction(user_id, parse_result, ocr_confidence=ocr_confidence)

        return {
            "receipt": {
                "merchant": parse_result.merchant,
                "amount": float(parse_result.amount),
                "date": parse_result.date,
                "category": parse_result.category,
                "ocr_confidence": ocr_result.confidence,
                "transaction_id": transaction.id,
            },
            "transaction": transaction.to_dict(),
        }
    except ReceiptOCRError as exc:
        raise ReceiptScanError(str(exc), 400)
    finally:
        if temp_path:
            shutil.rmtree(temp_dir, ignore_errors=True)