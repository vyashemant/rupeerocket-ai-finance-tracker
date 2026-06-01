import os
from datetime import timedelta

from dotenv import load_dotenv


load_dotenv()


def normalize_gemini_model(model_name):
    model = (model_name or "").strip()
    deprecated_aliases = {
        "gemini-3.5-flash": "gemini-2.5-flash",
        "gemini-3.5-pro": "gemini-2.5-pro",
    }
    return deprecated_aliases.get(model, model or "gemini-2.5-flash")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_MINUTES", "60")))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_TOKEN_DAYS", "30")))
    JWT_TOKEN_LOCATION = ["headers"]
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = normalize_gemini_model(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///rupeerocket.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    AUTO_CREATE_TABLES = os.getenv("AUTO_CREATE_TABLES", "true").lower() == "true"
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    MAX_RECEIPT_UPLOAD_MB = int(os.getenv("MAX_RECEIPT_UPLOAD_MB", "5"))
    MAX_RECEIPT_UPLOAD_BYTES = MAX_RECEIPT_UPLOAD_MB * 1024 * 1024
    RECEIPT_OCR_MIN_CONFIDENCE = float(os.getenv("RECEIPT_OCR_MIN_CONFIDENCE", "45"))
