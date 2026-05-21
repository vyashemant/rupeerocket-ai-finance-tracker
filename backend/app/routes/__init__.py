from app.routes.ai import ai_bp
from app.routes.analytics import analytics_bp
from app.routes.auth import auth_bp
from app.routes.categories import categories_bp
from app.routes.dashboard import dashboard_bp
from app.routes.transactions import transactions_bp


__all__ = [
    "auth_bp",
    "categories_bp",
    "transactions_bp",
    "dashboard_bp",
    "analytics_bp",
    "ai_bp",
]