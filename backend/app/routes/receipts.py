from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.receipt_scanner import ReceiptScanError, scan_receipt_upload
from app.utils.http import api_error, api_response


receipts_bp = Blueprint("receipts", __name__, url_prefix="/api/receipts")


@receipts_bp.post("/upload")
@jwt_required()
def upload_receipt():
    user_id = int(get_jwt_identity())
    upload_file = request.files.get("file") or request.files.get("receipt")

    if upload_file is None:
        return api_error("Receipt image file is required.")

    try:
        result = scan_receipt_upload(upload_file, user_id)
    except ReceiptScanError as exc:
        return api_error(exc.message, exc.status_code, details=exc.details)

    return api_response(result, "Receipt processed.", 201)