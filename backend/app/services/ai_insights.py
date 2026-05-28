import json
import re
from datetime import datetime

from app.services.finance import get_monthly_analytics, get_spending_trend
from app.utils.gemini import generate_text_with_gemini
from app.models import AIInsight
from app.extensions import db


def _clean_json_response(raw_text: str) -> str:
    cleaned = (raw_text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _parse_insight_payload(raw_text: str):
    cleaned = _clean_json_response(raw_text)
    if not cleaned:
        raise ValueError("Empty AI insight response.")

    try:
        parsed = json.loads(cleaned)
    except Exception:
        parsed = {
            "summary": cleaned.splitlines()[0][:200],
            "highlights": [],
            "recommendations": [],
        }

    if not isinstance(parsed, dict):
        raise ValueError("AI insight response was not a JSON object.")

    summary = parsed.get("summary")
    if not isinstance(summary, str) or not summary.strip():
        summary = "No AI insights available."

    highlights = parsed.get("highlights") if isinstance(parsed.get("highlights"), list) else []
    recommendations = parsed.get("recommendations") if isinstance(parsed.get("recommendations"), list) else []

    normalized = {
        "summary": summary.strip()[:240],
        "highlights": [str(item).strip() for item in highlights if str(item).strip()][:4],
        "recommendations": [str(item).strip() for item in recommendations if str(item).strip()][:4],
    }
    return normalized


def _is_valid_cached_insight(existing_insight):
    if not existing_insight:
        return False

    try:
        cleaned = _clean_json_response(existing_insight.insights_text)
        parsed = json.loads(cleaned)
    except Exception:
        return False

    if not isinstance(parsed, dict):
        return False

    summary_text = (existing_insight.summary_text or "").strip()
    if not summary_text:
        summary_text = str(parsed.get("summary", "")).strip()

    if summary_text in {"", "{", "}", "[]"}:
        return False
    return True


def _build_insights_prompt(analytics, trend_series):
    # compact JSON payload to save tokens
    payload = {
        "month": analytics["month"],
        "income": analytics["income"],
        "expenses": analytics["expenses"],
        "net": analytics["net"],
        "top_expenses": analytics.get("expense_breakdown", [])[:5],
        "daily_samples": analytics.get("daily_expenses", [])[:7],
        "recent_trend": trend_series[-6:],
    }

    instr = (
        "You are a concise, conservative financial insights assistant.\n"
        "Given the structured JSON input, produce a short JSON object with keys:\n"
        '  - "summary": one-sentence professional summary (no more than 80 chars),\n'
        '  - "highlights": array of 1-4 short observations (each < 60 chars),\n'
        '  - "recommendations": array of 1-4 short action items with optional estimated monthly savings (like "Reduce dining by 15% -> save ₹3000").\n'
        "Only return valid JSON — do not add explanations, markdown, or extra keys. If a numeric estimate is not possible, use the text 'estimate_unavailable'.\n"
        "Avoid fabricating facts; only use numbers present in the input.\n"
        "Input JSON:\n"
    )

    prompt = instr + json.dumps(payload, separators=(",", ":")) + "\nOutput JSON:" 
    return prompt


def generate_insights(user_id, year, month, *, force_refresh=False):
    month_key = f"{year:04d}-{month:02d}"
    existing = AIInsight.query.filter_by(user_id=user_id, month=month_key).order_by(AIInsight.created_at.desc()).first()
    if existing and not force_refresh and _is_valid_cached_insight(existing):
        return existing

    analytics = get_monthly_analytics(user_id, year, month)
    trend = get_spending_trend(user_id, months=6)

    prompt = _build_insights_prompt(analytics, trend)

    try:
        result = generate_text_with_gemini(prompt, max_output_tokens=300)
        payload = _parse_insight_payload(result.text or "")
    except Exception as exc:
        payload = {"summary": "No AI insights available.", "highlights": [], "recommendations": []}

    insight = AIInsight(
        user_id=user_id,
        month=month_key,
        insights_text=json.dumps(payload, ensure_ascii=False),
        summary_text=payload["summary"],
        provider=None,
        raw_response=json.dumps(payload, ensure_ascii=False),
        tokens_used=None,
    )
    db.session.add(insight)
    db.session.commit()
    return insight


def generate_ai_insights(user_id):
    """Compatibility wrapper used by routes: generate insights for current month and return dict."""
    now = datetime.utcnow()
    insight = generate_insights(user_id, now.year, now.month)
    return insight.to_dict() if insight else {"summary": "No insights available."}


def generate_ai_insights_for_month(user_id, year, month):
    """Generate or fetch cached AI insights for a specific month."""
    insight = generate_insights(user_id, year, month)
    return insight.to_dict() if insight else {"summary": "No insights available."}