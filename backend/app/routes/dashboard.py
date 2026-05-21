from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.finance import get_dashboard_summary, get_spending_trend
from app.utils.http import api_response


dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("/summary")
@jwt_required()
def summary():
    user_id = int(get_jwt_identity())
    return api_response({"summary": get_dashboard_summary(user_id)})


@dashboard_bp.get("/trend")
@jwt_required()
def trend():
    user_id = int(get_jwt_identity())
    return api_response({"items": get_spending_trend(user_id)})