import base64
import hashlib
import hmac
import json
from secrets import token_urlsafe
from app.core.config import get_settings


def _b64_json(value: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(value, separators=(",", ":")).encode()).decode().rstrip("=")


def _sign(encoded_payload: str) -> str:
    secret = get_settings().qr_signing_secret.encode()
    digest = hmac.new(secret, encoded_payload.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")


def create_secure_qr_token(event_id: str, ticket_id: str) -> str:
    payload = {
        "version": "v1",
        "event_id": event_id,
        "ticket_id": ticket_id,
        "nonce": token_urlsafe(18),
    }
    encoded = _b64_json(payload)
    return f"gpqr.{encoded}.{_sign(encoded)}"


def hash_qr_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def verify_qr_token(token: str) -> tuple[bool, dict | None, str | None]:
    parts = token.split(".")
    if len(parts) != 3 or parts[0] != "gpqr":
        return False, None, "Malformed QR token"
    expected = _sign(parts[1])
    if not hmac.compare_digest(expected, parts[2]):
        return False, None, "QR signature mismatch"
    padded = parts[1] + "=" * (-len(parts[1]) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(padded.encode()).decode())
    except Exception:
        return False, None, "QR payload is unreadable"
    return True, payload, None
