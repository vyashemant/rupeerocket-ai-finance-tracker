from datetime import datetime

from app.extensions import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title = db.Column(db.String(140), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    transaction_type = db.Column(db.String(16), nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    notes = db.Column(db.Text, nullable=True)
    ai_category_name = db.Column(db.String(80), nullable=True)
    ai_category_confidence = db.Column(db.Float, nullable=True)
    ai_category_source = db.Column(db.String(32), nullable=True)
    ai_category_provider = db.Column(db.String(64), nullable=True)
    ai_category_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user = db.relationship("User", back_populates="transactions")
    category = db.relationship("Category", back_populates="transactions")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "title": self.title,
            "amount": float(self.amount),
            "type": self.transaction_type,
            "date": self.date.isoformat() if self.date else None,
            "notes": self.notes,
            "ai_category": {
                "name": self.ai_category_name,
                "confidence": self.ai_category_confidence,
                "source": self.ai_category_source,
                "provider": self.ai_category_provider,
                "reason": self.ai_category_reason,
            }
            if any(
                [
                    self.ai_category_name,
                    self.ai_category_confidence is not None,
                    self.ai_category_source,
                    self.ai_category_provider,
                    self.ai_category_reason,
                ]
            )
            else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }