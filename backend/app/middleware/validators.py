from functools import wraps
from flask import request

from app.utils.http import api_error


def validate_json(required_fields=None):
    required_fields = required_fields or []

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            payload = request.get_json(silent=True) or {}
            missing = [f for f in required_fields if not payload.get(f)]
            if missing:
                return api_error(f"Missing required fields: {', '.join(missing)}", 400)
            return fn(*args, **kwargs)

        return wrapper

    return decorator
