from dataclasses import asdict, dataclass

from app.config import Config
from app.services.finance import get_default_category_names
from app.utils.gemini import (
    build_category_prompt,
    generate_text_with_gemini,
    keyword_category_match,
    normalize_category_name,
)


TRANSACTION_CATEGORY_KEYWORDS = {
    "Food": ["swiggy", "zomato", "restaurant", "dinner", "lunch", "breakfast", "cafe", "food", "meal", "groceries"],
    "Travel": ["uber", "ola", "cab", "taxi", "flight", "train", "bus", "metro", "fuel", "petrol", "diesel", "ticket"],
    "Shopping": ["amazon", "flipkart", "myntra", "shopping", "store", "mall", "purchase", "order"],
    "Bills": ["electricity", "bill", "water", "gas", "internet", "mobile recharge", "rent", "utility", "subscription"],
    "Entertainment": ["netflix", "prime", "hotstar", "spotify", "movie", "theatre", "game", "concert"],
    "Health": ["medicine", "medical", "pharmacy", "hospital", "doctor", "clinic", "health"],
    "Education": ["school", "college", "course", "tuition", "class", "book", "education", "fees"],
    "Salary": ["salary", "payroll", "stipend", "income", "wage", "bonus"],
    "Investments": ["investment", "mutual fund", "sip", "stocks", "stock", "fd", "rd", "nps", "equity"],
}


@dataclass(frozen=True)
class CategoryPrediction:
    category_name: str
    confidence: float
    source: str
    provider: str
    raw_response: str | None = None
    fallback_reason: str | None = None

    def to_dict(self):
        return asdict(self)


def _fallback_prediction(text, transaction_type):
    keyword_category = keyword_category_match(text, TRANSACTION_CATEGORY_KEYWORDS)
    if keyword_category:
        return CategoryPrediction(
            category_name=keyword_category,
            confidence=0.78,
            source="keyword_fallback",
            provider="rules",
        )

    if (transaction_type or "").strip().lower() == "income":
        return CategoryPrediction(
            category_name="Salary",
            confidence=0.62,
            source="keyword_fallback",
            provider="rules",
            fallback_reason="Income transaction without a stronger keyword match.",
        )

    return CategoryPrediction(
        category_name="Other",
        confidence=0.50,
        source="default_fallback",
        provider="rules",
        fallback_reason="No strong keyword match was found.",
    )


def predict_transaction_category(*, title, amount, transaction_type, notes=None):
    allowed_categories = get_default_category_names()
    prompt = build_category_prompt(
        title=title,
        amount=amount,
        transaction_type=transaction_type,
        notes=notes,
        categories=allowed_categories,
    )

    try:
        gemini_result = generate_text_with_gemini(
            prompt,
            api_key=Config.GEMINI_API_KEY,
            model_name=Config.GEMINI_MODEL,
        )
        predicted_name = normalize_category_name(gemini_result.text, allowed_categories)
        if predicted_name:
            return CategoryPrediction(
                category_name=predicted_name,
                confidence=0.93,
                source="gemini",
                provider=Config.GEMINI_MODEL,
                raw_response=gemini_result.text,
            )
    except Exception as exc:
        fallback = _fallback_prediction(f"{title} {notes or ''}", transaction_type)
        return CategoryPrediction(
            category_name=fallback.category_name,
            confidence=fallback.confidence,
            source="gemini_fallback",
            provider="rules",
            raw_response=None,
            fallback_reason=str(exc),
        )

    fallback = _fallback_prediction(f"{title} {notes or ''}", transaction_type)
    return fallback