from flask import Blueprint, request
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required

from app.middleware.validators import validate_json

from app.extensions import db
from app.models import User
from app.services.finance import ensure_default_categories
from app.utils.http import api_error, api_response
from app.utils.security import hash_password, is_valid_email, normalize_email, verify_password


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
@validate_json(["full_name", "email", "password"])
def register():
    payload = request.get_json(silent=True) or {}
    full_name = (payload.get("full_name") or "").strip()
    email = normalize_email(payload.get("email") or "")
    password = payload.get("password") or ""

    if not full_name:
        return api_error("Full name is required.")
    if not is_valid_email(email):
        return api_error("A valid email address is required.")
    if len(password) < 8:
        return api_error("Password must be at least 8 characters long.")
    if User.query.filter_by(email=email).first():
        return api_error("An account already exists for this email.", 409)

    user = User(full_name=full_name, email=email, password_hash=hash_password(password))
    db.session.add(user)
    db.session.commit()

    ensure_default_categories(user.id)

    access_token = create_access_token(identity=str(user.id), additional_claims={"email": user.email})
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims={"email": user.email})
    return api_response({"token": access_token, "refresh_token": refresh_token, "user": user.to_dict()}, "Account created.", 201)


@auth_bp.post("/login")
@validate_json(["email", "password"])
def login():
    payload = request.get_json(silent=True) or {}
    email = normalize_email(payload.get("email") or "")
    password = payload.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(user.password_hash, password):
        return api_error("Invalid email or password.", 401)

    ensure_default_categories(user.id)
    access_token = create_access_token(identity=str(user.id), additional_claims={"email": user.email})
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims={"email": user.email})
    return api_response({"token": access_token, "refresh_token": refresh_token, "user": user.to_dict()}, "Signed in successfully.")


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    access_token = create_access_token(identity=str(user.id), additional_claims={"email": user.email})
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims={"email": user.email})
    return api_response({"token": access_token, "refresh_token": refresh_token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return api_response({"user": user.to_dict()})