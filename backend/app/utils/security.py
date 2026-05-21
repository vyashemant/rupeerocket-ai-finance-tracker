import re
from decimal import Decimal, InvalidOperation

from app.extensions import bcrypt


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def hash_password(password: str) -> str:
    pw = password or ""
    return bcrypt.generate_password_hash(pw).decode('utf-8')


def verify_password(password_hash: str, password: str) -> bool:
    return bcrypt.check_password_hash(password_hash, password or "")


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def is_valid_email(email: str) -> bool:
    return bool(EMAIL_PATTERN.match(email or ""))


def parse_decimal(value, default=None):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return default