from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.finance import get_monthly_analytics
from app.utils.http import api_error, api_response


analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@analytics_bp.get("/monthly")
@jwt_required()
def monthly():
    user_id = int(get_jwt_identity())
    month = request.args.get("month")
    if month:
        try:
            target = datetime.strptime(month, "%Y-%m")
        except ValueError:
            return api_error("Month must be formatted as YYYY-MM.")
    else:
        target = datetime.utcnow()
    return api_response({"analytics": get_monthly_analytics(user_id, target.year, target.month)})