from app.services.finance import get_summary_insights


def generate_ai_insights(user_id):
    return {
        "engine": "rules-v1",
        "insights": get_summary_insights(user_id),
        "next_step": "This service is isolated so a model provider can be added later without changing API contracts.",
    }