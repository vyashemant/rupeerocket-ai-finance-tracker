from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.ai_insights import generate_ai_insights
from app.utils.http import api_response


ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.get("/insights")
@jwt_required()
def insights():
    user_id = int(get_jwt_identity())
    return api_response({"insights": generate_ai_insights(user_id)})