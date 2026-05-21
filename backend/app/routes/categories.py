from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Category
from app.services.finance import ensure_default_categories
from app.utils.http import api_error, api_response


categories_bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@categories_bp.get("")
@jwt_required()
def list_categories():
    user_id = int(get_jwt_identity())
    ensure_default_categories(user_id)
    categories = Category.query.filter_by(user_id=user_id).order_by(Category.name.asc()).all()
    return api_response({"items": [category.to_dict() for category in categories]})


@categories_bp.post("")
@jwt_required()
def create_category():
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    color = (payload.get("color") or "#2563eb").strip()
    if not name:
        return api_error("Category name is required.")
    if Category.query.filter_by(user_id=user_id, name=name).first():
        return api_error("That category already exists.", 409)

    category = Category(user_id=user_id, name=name, color=color)
    db.session.add(category)
    db.session.commit()
    return api_response({"category": category.to_dict()}, "Category created.", 201)


@categories_bp.put("/<int:category_id>")
@jwt_required()
def update_category(category_id):
    user_id = int(get_jwt_identity())
    category = Category.query.filter_by(id=category_id, user_id=user_id).first_or_404()
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or category.name).strip()
    color = (payload.get("color") or category.color).strip()
    category.name = name
    category.color = color
    db.session.commit()
    return api_response({"category": category.to_dict()}, "Category updated.")


@categories_bp.delete("/<int:category_id>")
@jwt_required()
def delete_category(category_id):
    user_id = int(get_jwt_identity())
    category = Category.query.filter_by(id=category_id, user_id=user_id).first_or_404()
    db.session.delete(category)
    db.session.commit()
    return api_response(message="Category deleted.")