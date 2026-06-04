import os
import json
import base64
import time
import secrets
import hashlib
from datetime import datetime
import jwt
from cryptography.hazmat.primitives import serialization
from app.core.store import store, now
from app.core.errors import invariant

# We use the app.core.config if available, but os.getenv is fine since we load dotenv.
def get_app_url() -> str:
    return os.getenv("APP_URL", "http://localhost:3000")

def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def get_or_create_google_wallet_object(ticket_id: str) -> dict:
    # 1. Fetch ticket and event
    ticket = next((t for t in store.tickets if t.id == ticket_id), None)
    invariant(ticket is not None, 404, "TICKET_NOT_FOUND", "Ticket not found")
    
    event = next((e for e in store.events if e.id == ticket.event_id), None)
    invariant(event is not None, 404, "EVENT_NOT_FOUND", "Event not found")

    issuer_id = os.getenv("GOOGLE_WALLET_ISSUER_ID", "338800000023140269")
    class_id = os.getenv("GOOGLE_WALLET_CLASS_ID", f"{issuer_id}.gatepass_class")
    
    # 2. Generate secure token for the wallet pass
    secure_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(secure_token)
    
    # Update ticket schema
    ticket.qr_token_hash = token_hash
    ticket.wallet_added_at = now()
    
    object_id = f"{issuer_id}.gatepass_{ticket.id.replace('-', '')}"
    ticket.google_wallet_object_id = object_id

    # 3. Create generic object payload
    barcode_value = f"{get_app_url()}/api/gatepass/verify/{secure_token}"
    
    generic_object = {
        "id": object_id,
        "classId": class_id,
        "state": "ACTIVE" if ticket.status == "issued" else "INACTIVE",
        "barcode": {
            "type": "QR_CODE",
            "value": barcode_value,
            "alternateText": ticket.id
        },
        "cardTitle": {
            "defaultValue": {
                "language": "en-US",
                "value": "GatePass"
            }
        },
        "header": {
            "defaultValue": {
                "language": "en-US",
                "value": event.title
            }
        },
        "subheader": {
            "defaultValue": {
                "language": "en-US",
                "value": event.venue
            }
        },
        "hexBackgroundColor": "#111827",
        "textModulesData": [
            {
                "header": "Holder Name",
                "body": ticket.attendee_name,
                "id": "holderName"
            },
            {
                "header": "Ticket ID",
                "body": ticket.id,
                "id": "ticketId"
            },
            {
                "header": "Status",
                "body": str(ticket.status).upper(),
                "id": "status"
            },
            {
                "header": "Valid Until",
                "body": event.end_time.strftime("%b %d, %Y %H:%M"),
                "id": "validUntil"
            },
            {
                "header": "Gate/Location",
                "body": event.venue,
                "id": "location"
            }
        ],
        "linksModuleData": {
            "uris": [
                {
                    "uri": f"{get_app_url()}/tickets/{ticket.id}",
                    "description": "View Ticket URL"
                }
            ]
        }
    }
    return generic_object

def generate_signed_save_url(ticket_id: str) -> dict:
    generic_object = get_or_create_google_wallet_object(ticket_id)
    
    issuer_email = os.getenv("GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL")
    private_key_str = os.getenv("GOOGLE_WALLET_PRIVATE_KEY")
    service_account_json = os.getenv("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON")

    if service_account_json:
        try:
            creds = json.loads(service_account_json)
            issuer_email = creds.get("client_email", issuer_email)
            private_key_str = creds.get("private_key", private_key_str)
        except json.JSONDecodeError:
            pass

    if not issuer_email or not private_key_str:
        invariant(False, 500, "WALLET_NOT_CONFIGURED", "Google Wallet credentials are not configured")

    private_key_str = private_key_str.replace("\\n", "\n")
    
    claims = {
        "iss": issuer_email,
        "aud": "google",
        "typ": "savetowallet",
        "iat": int(time.time()),
        "payload": {
            "genericObjects": [generic_object]
        }
    }

    try:
        # Load the private key using cryptography for PyJWT
        private_key = serialization.load_pem_private_key(
            private_key_str.encode('utf-8'),
            password=None
        )
        token = jwt.encode(claims, private_key, algorithm="RS256")
    except Exception as e:
        invariant(False, 500, "SIGNING_FAILED", f"Failed to sign JWT: {str(e)}")

    save_url = f"https://pay.google.com/gp/v/save/{token}"
    return {
        "saveUrl": save_url,
        "objectId": generic_object["id"]
    }
