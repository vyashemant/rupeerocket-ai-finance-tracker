from datetime import datetime
import json

from app.services.finance import get_monthly_analytics, get_spending_trend
from app.utils.gemini import generate_text_with_gemini
from app.models import AIInsight
from app.extensions import db


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
    if existing and not force_refresh:
        return existing

    analytics = get_monthly_analytics(user_id, year, month)
    trend = get_spending_trend(user_id, months=6)

    prompt = _build_insights_prompt(analytics, trend)

    try:
        result = generate_text_with_gemini(prompt, max_output_tokens=300)
        text = result.text or ""
    except Exception as exc:
        text = json.dumps({"summary": "No AI insights available.", "highlights": [], "recommendations": []})

    # try to parse JSON safely
    try:
        parsed = json.loads(text)
    except Exception:
        parsed = {"summary": text.splitlines()[0][:200], "highlights": [], "recommendations": []}

    summary_text = parsed.get("summary") if isinstance(parsed, dict) else str(parsed)[:256]

    insight = AIInsight(
        user_id=user_id,
        month=month_key,
        insights_text=text,
        summary_text=summary_text,
        provider=None,
        raw_response=text,
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