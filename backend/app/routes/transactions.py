from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.middleware.validators import validate_json
from app.extensions import db
from app.models import Category, Transaction
from app.services.ai_service import predict_transaction_category
from app.services.finance import ensure_default_categories
from app.utils.http import api_error, api_response
from app.utils.security import parse_decimal


transactions_bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")


def _get_transaction_or_404(transaction_id, user_id):
    return Transaction.query.filter_by(id=transaction_id, user_id=user_id).first_or_404()


@transactions_bp.get("")
@jwt_required()
def list_transactions():
    user_id = int(get_jwt_identity())
    limit = int(request.args.get("limit", 20))
    transaction_type = request.args.get("type")
    query = Transaction.query.filter_by(user_id=user_id)
    if transaction_type in {"income", "expense"}:
        query = query.filter_by(transaction_type=transaction_type)
    items = query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).limit(limit).all()
    return api_response({"items": [item.to_dict() for item in items]})


@transactions_bp.post("")
@jwt_required()
@validate_json(["title", "amount", "type", "date"])
def create_transaction():
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    title = (payload.get("title") or "").strip()
    amount = parse_decimal(payload.get("amount"))
    transaction_type = (payload.get("type") or "").strip().lower()
    category_id = payload.get("category_id")
    transaction_date = payload.get("date")
    notes = payload.get("notes")

    if not title:
        return api_error("Title is required.")
    if amount is None or amount <= 0:
        return api_error("Amount must be greater than zero.")
    if transaction_type not in {"income", "expense"}:
        return api_error("Transaction type must be income or expense.")
    try:
        parsed_date = datetime.strptime(transaction_date, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return api_error("Date must be in YYYY-MM-DD format.")

    ensure_default_categories(user_id)

    ai_prediction = predict_transaction_category(
        title=title,
        amount=amount,
        transaction_type=transaction_type,
        notes=notes,
    )

    predicted_category = None
    if category_id is None:
        predicted_category = Category.query.filter_by(user_id=user_id, name=ai_prediction.category_name).first()
        if not predicted_category:
            predicted_category = Category.query.filter_by(user_id=user_id, name="Other").first()

    category = None
    if category_id is not None:
        category = Category.query.filter_by(id=category_id, user_id=user_id).first()
        if not category:
            return api_error("Selected category does not exist.")
    else:
        category = predicted_category

    transaction = Transaction(
        user_id=user_id,
        category_id=category.id if category else None,
        title=title,
        amount=amount,
        transaction_type=transaction_type,
        date=parsed_date,
        notes=notes,
        ai_category_name=ai_prediction.category_name,
        ai_category_confidence=ai_prediction.confidence,
        ai_category_source=ai_prediction.source,
        ai_category_provider=ai_prediction.provider,
        ai_category_reason=ai_prediction.fallback_reason,
    )
    db.session.add(transaction)
    db.session.commit()
    transaction_payload = transaction.to_dict()
    return api_response(
        {
            "transaction": transaction_payload,
            "ai_category": transaction_payload.get("ai_category"),
        },
        "Transaction created.",
        201,
    )


@transactions_bp.put("/<int:transaction_id>")
@jwt_required()
def update_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    transaction = _get_transaction_or_404(transaction_id, user_id)
    payload = request.get_json(silent=True) or {}

    if "title" in payload:
        title = (payload.get("title") or "").strip()
        if not title:
            return api_error("Title cannot be empty.")
        transaction.title = title
    if "amount" in payload:
        amount = parse_decimal(payload.get("amount"))
        if amount is None or amount <= 0:
            return api_error("Amount must be greater than zero.")
        transaction.amount = amount
    if payload.get("type") in {"income", "expense"}:
        transaction.transaction_type = payload.get("type")
    if "date" in payload:
        try:
            transaction.date = datetime.strptime(payload.get("date"), "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return api_error("Date must be in YYYY-MM-DD format.")
    if "notes" in payload:
        transaction.notes = payload.get("notes")
    if "category_id" in payload:
        category_id = payload.get("category_id")
        if category_id is None:
            transaction.category_id = None
        else:
            category = Category.query.filter_by(id=category_id, user_id=user_id).first()
            if not category:
                return api_error("Selected category does not exist.")
            transaction.category_id = category.id

    db.session.commit()
    return api_response({"transaction": transaction.to_dict()}, "Transaction updated.")


@transactions_bp.delete("/<int:transaction_id>")
@jwt_required()
def delete_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    transaction = _get_transaction_or_404(transaction_id, user_id)
    db.session.delete(transaction)
    db.session.commit()
    return api_response(message="Transaction deleted.")