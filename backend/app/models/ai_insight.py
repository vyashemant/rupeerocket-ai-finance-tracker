from datetime import datetime

from app.extensions import db


class AIInsight(db.Model):
    __tablename__ = "ai_insights"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    month = db.Column(db.String(7), nullable=False, index=True)  # YYYY-MM
    insights_text = db.Column(db.Text, nullable=False)
    summary_text = db.Column(db.String(256), nullable=True)
    provider = db.Column(db.String(64), nullable=True)
    raw_response = db.Column(db.Text, nullable=True)
    tokens_used = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "month": self.month,
            "insights_text": self.insights_text,
            "summary_text": self.summary_text,
            "provider": self.provider,
            "tokens_used": self.tokens_used,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
