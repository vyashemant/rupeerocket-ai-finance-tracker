from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.ai_insights import generate_ai_insights, generate_ai_insights_for_month
from app.utils.http import api_error, api_response


ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.get("/insights")
@jwt_required()
def insights():
    user_id = int(get_jwt_identity())
    month = request.args.get("month")
    force_refresh = str(request.args.get("force", "")).lower() in {"1", "true", "yes"}
    if month:
        try:
            target = datetime.strptime(month, "%Y-%m")
        except ValueError:
            return api_error("Month must be formatted as YYYY-MM.")
        insights = generate_ai_insights_for_month(user_id, target.year, target.month, force_refresh=force_refresh)
    else:
        insights = generate_ai_insights(user_id, force_refresh=force_refresh)
    return api_response({"insights": insights})
