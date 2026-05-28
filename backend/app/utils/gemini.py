import os
import re
from pathlib import Path
from dataclasses import dataclass


@dataclass(frozen=True)
class GeminiTextResult:
    text: str
    raw_response: str | None = None


def get_gemini_api_key():
    return os.getenv("GEMINI_API_KEY", "").strip()


def get_gemini_model_name(default_model="gemini-3.5-flash"):
    return os.getenv("GEMINI_MODEL", default_model).strip() or default_model


def create_gemini_client(api_key):
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    try:
        from google import genai
    except ImportError as exc:
        raise RuntimeError("google-genai is not installed.") from exc

    return genai.Client(api_key=api_key)


def extract_response_text(response):
    response_text = getattr(response, "text", None)
    if response_text:
        return str(response_text).strip()

    candidates = getattr(response, "candidates", None) or []
    text_parts = []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if part_text:
                text_parts.append(str(part_text))

    return "".join(text_parts).strip()


def generate_text_with_gemini(prompt, *, api_key=None, model_name=None, max_output_tokens=None):
    api_key = api_key if api_key is not None else get_gemini_api_key()
    model_name = model_name if model_name is not None else get_gemini_model_name()
    client = create_gemini_client(api_key)
    cfg = {
        "temperature": 0,
        "top_p": 1,
        "top_k": 1,
    }
    if max_output_tokens is not None:
        cfg["max_output_tokens"] = int(max_output_tokens)
    else:
        cfg["max_output_tokens"] = 64

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=cfg,
    )
    response_text = extract_response_text(response)
    return GeminiTextResult(text=response_text, raw_response=str(response))


def generate_json_with_gemini(prompt, *, api_key=None, model_name=None, max_output_tokens=None):
    api_key = api_key if api_key is not None else get_gemini_api_key()
    model_name = model_name if model_name is not None else get_gemini_model_name()
    client = create_gemini_client(api_key)
    cfg = {
        "temperature": 0,
        "top_p": 1,
        "top_k": 1,
        "response_mime_type": "application/json",
    }
    if max_output_tokens is not None:
        cfg["max_output_tokens"] = int(max_output_tokens)
    else:
        cfg["max_output_tokens"] = 256

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=cfg,
    )
    response_text = extract_response_text(response)
    return GeminiTextResult(text=response_text, raw_response=str(response))


def generate_json_with_gemini_image(prompt, image_path, *, api_key=None, model_name=None, max_output_tokens=None):
    api_key = api_key if api_key is not None else get_gemini_api_key()
    model_name = model_name if model_name is not None else get_gemini_model_name()
    client = create_gemini_client(api_key)
    cfg = {
        "temperature": 0,
        "top_p": 1,
        "top_k": 1,
        "response_mime_type": "application/json",
    }
    if max_output_tokens is not None:
        cfg["max_output_tokens"] = int(max_output_tokens)
    else:
        cfg["max_output_tokens"] = 256

    image_bytes = Path(image_path).read_bytes()
    mime_type = "image/png"
    suffix = Path(image_path).suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        mime_type = "image/jpeg"

    try:
        from google.genai import types
    except ImportError as exc:
        raise RuntimeError("google-genai types helpers are not available.") from exc

    response = client.models.generate_content(
        model=model_name,
        contents=[
            prompt,
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        ],
        config=cfg,
    )
    response_text = extract_response_text(response)
    return GeminiTextResult(text=response_text, raw_response=str(response))


def build_category_prompt(*, title, amount, transaction_type, notes, categories):
    categories_text = ", ".join(categories)
    notes_text = notes.strip() if isinstance(notes, str) else ""
    amount_text = f"{amount:.2f}" if amount is not None else "unknown"
    transaction_type_text = (transaction_type or "unknown").strip().lower()

    return (
        "You are a deterministic finance categorization engine.\n"
        "Return exactly one category name from the allowed list.\n"
        "Do not explain, add punctuation, use markdown, or include extra words.\n"
        "If the transaction does not clearly match, return Other.\n"
        f"Allowed categories: {categories_text}\n"
        f"Transaction title: {title.strip()}\n"
        f"Transaction type: {transaction_type_text}\n"
        f"Amount: {amount_text}\n"
        f"Notes: {notes_text or 'none'}\n"
        "Category:"
    )


def normalize_category_name(value, allowed_categories):
    if not value:
        return None

    cleaned = re.sub(r"[^A-Za-z ]+", " ", str(value)).strip().lower()
    if not cleaned:
        return None

    allowed_lookup = {category.lower(): category for category in allowed_categories}
    if cleaned in allowed_lookup:
        return allowed_lookup[cleaned]

    first_line = cleaned.splitlines()[0].strip()
    return allowed_lookup.get(first_line)


def keyword_category_match(text, keyword_rules):
    normalized = (text or "").strip().lower()
    for category, keywords in keyword_rules.items():
        if any(keyword in normalized for keyword in keywords):
            return category
    return None