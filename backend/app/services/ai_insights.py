import json
import re
from hashlib import sha256
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
    if "{" in cleaned and "}" in cleaned:
        cleaned = cleaned[cleaned.find("{") : cleaned.rfind("}") + 1]
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


def _analytics_fingerprint(analytics, trend_series):
    payload = {
        "month": analytics.get("month"),
        "income": analytics.get("income"),
        "expenses": analytics.get("expenses"),
        "net": analytics.get("net"),
        "expense_breakdown": analytics.get("expense_breakdown", []),
        "daily_expenses": analytics.get("daily_expenses", []),
        "trend": trend_series[-6:],
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return sha256(encoded).hexdigest()


def _cached_insight_fingerprint(existing_insight):
    try:
        raw = json.loads(existing_insight.raw_response or "{}")
    except Exception:
        return None
    if isinstance(raw, dict):
        return raw.get("analytics_hash")
    return None


def _is_valid_cached_insight(existing_insight, analytics_hash):
    if not existing_insight:
        return False
    if _cached_insight_fingerprint(existing_insight) != analytics_hash:
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


def _payload_conflicts_with_analytics(payload, analytics):
    has_activity = float(analytics.get("income") or 0) > 0 or float(analytics.get("expenses") or 0) > 0
    if not has_activity:
        return False

    combined_text = " ".join(
        [
            str(payload.get("summary", "")),
            " ".join(str(item) for item in payload.get("highlights", [])),
            " ".join(str(item) for item in payload.get("recommendations", [])),
        ]
    ).lower()
    stale_phrases = [
        "no financial activity",
        "no activity",
        "no transactions",
        "nothing recorded",
        "no spending data",
    ]
    return any(phrase in combined_text for phrase in stale_phrases)


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


def _build_rule_based_insights(analytics, trend_series):
    income = float(analytics.get("income") or 0)
    expenses = float(analytics.get("expenses") or 0)
    net = float(analytics.get("net") or 0)
    breakdown = analytics.get("expense_breakdown") or []

    if income == 0 and expenses == 0:
        return {
            "summary": "Add transactions to unlock personalized insights.",
            "highlights": ["No activity is recorded for this month."],
            "recommendations": ["Add income and expenses for this month."],
        }

    savings_rate = (net / income * 100) if income else None
    if savings_rate is None:
        summary = f"Expenses are Rs {expenses:,.0f} this month."
    elif savings_rate >= 20:
        summary = f"Healthy month with {savings_rate:.0f}% saved."
    elif savings_rate >= 0:
        summary = f"Positive month with {savings_rate:.0f}% saved."
    else:
        summary = f"Spending exceeded income by Rs {abs(net):,.0f}."

    highlights = []
    if income:
        expense_ratio = expenses / income * 100
        highlights.append(f"Expenses used {expense_ratio:.0f}% of income.")
    if breakdown:
        top = breakdown[0]
        highlights.append(f"{top.get('name', 'Top category')} led spending at Rs {float(top.get('amount') or 0):,.0f}.")
    if len(trend_series) >= 2:
        previous = float((trend_series[-2] or {}).get("expenses") or 0)
        current = float((trend_series[-1] or {}).get("expenses") or 0)
        if previous:
            change = (current - previous) / previous * 100
            direction = "up" if change > 0 else "down"
            highlights.append(f"Expenses are {direction} {abs(change):.0f}% vs last month.")

    recommendations = []
    if breakdown:
        top = breakdown[0]
        top_amount = float(top.get("amount") or 0)
        recommendations.append(f"Trim {top.get('name', 'top spending')} by 10% to save Rs {top_amount * 0.1:,.0f}.")
    if savings_rate is not None and savings_rate < 20:
        recommendations.append("Aim for a 20% savings rate this month.")
    if expenses and not recommendations:
        recommendations.append("Keep reviewing large expenses weekly.")

    return {
        "summary": summary[:240],
        "highlights": highlights[:4],
        "recommendations": recommendations[:4],
    }


def generate_insights(user_id, year, month, *, force_refresh=False):
    month_key = f"{year:04d}-{month:02d}"
    analytics = get_monthly_analytics(user_id, year, month)
    trend = get_spending_trend(user_id, months=6)
    analytics_hash = _analytics_fingerprint(analytics, trend)

    existing = AIInsight.query.filter_by(user_id=user_id, month=month_key).order_by(AIInsight.created_at.desc()).first()
    if existing and not force_refresh and _is_valid_cached_insight(existing, analytics_hash):
        return existing

    prompt = _build_insights_prompt(analytics, trend)

    provider = None
    raw_response = None
    try:
        result = generate_text_with_gemini(prompt, max_output_tokens=300)
        payload = _parse_insight_payload(result.text or "")
        if _payload_conflicts_with_analytics(payload, analytics):
            raise ValueError("AI response contradicted the current analytics payload.")
        provider = "gemini"
        raw_response = {
            "analytics_hash": analytics_hash,
            "provider_response": result.raw_response or result.text,
        }
    except Exception as exc:
        payload = _build_rule_based_insights(analytics, trend)
        provider = "rules"
        raw_response = {
            "analytics_hash": analytics_hash,
            "fallback_reason": str(exc),
            "payload": payload,
        }

    insight = AIInsight(
        user_id=user_id,
        month=month_key,
        insights_text=json.dumps(payload, ensure_ascii=False),
        summary_text=payload["summary"],
        provider=provider,
        raw_response=json.dumps(raw_response, ensure_ascii=False),
        tokens_used=None,
    )
    db.session.add(insight)
    db.session.commit()
    return insight


def generate_ai_insights(user_id, *, force_refresh=False):
    """Compatibility wrapper used by routes: generate insights for current month and return dict."""
    now = datetime.utcnow()
    insight = generate_insights(user_id, now.year, now.month, force_refresh=force_refresh)
    return insight.to_dict() if insight else {"summary": "No insights available."}


def generate_ai_insights_for_month(user_id, year, month, *, force_refresh=False):
    """Generate or fetch cached AI insights for a specific month."""
    insight = generate_insights(user_id, year, month, force_refresh=force_refresh)
    return insight.to_dict() if insight else {"summary": "No insights available."}
