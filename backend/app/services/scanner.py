from app.core.store import new_id, now, store
from app.schemas import ScanLog, ScannerValidate, ScanState, TicketStatus
from app.services.audit import log_audit
from app.services.qr import hash_qr_token, verify_qr_token


def validate_scan(payload: ScannerValidate) -> dict:
    valid, qr_payload, reason = verify_qr_token(payload.qr_token)
    state = ScanState.INVALID
    message = reason or "Token not found"
    ticket = None
    if valid and qr_payload:
        token_hash = hash_qr_token(payload.qr_token)
        token = next((item for item in store.ticket_tokens if item.token_hash == token_hash), None)
        ticket = next((item for item in store.tickets if token and item.id == token.ticket_id), None)
        if not ticket:
            state = ScanState.INVALID
            message = "Ticket record missing"
        elif qr_payload.get("ticket_id") != ticket.id or qr_payload.get("event_id") != ticket.event_id:
            state = ScanState.INVALID
            message = "QR payload does not match ticket"
        elif payload.event_id != "auto" and ticket.event_id != payload.event_id:
            state = ScanState.WRONG_EVENT
            message = "Ticket belongs to another event"
        elif ticket.status == TicketStatus.CANCELLED:
            state = ScanState.CANCELLED
            message = "Ticket is cancelled"
        elif ticket.status == TicketStatus.REFUNDED:
            state = ScanState.REFUNDED
            message = "Ticket is refunded"
        elif ticket.status == TicketStatus.EXPIRED:
            state = ScanState.EXPIRED
            message = "Ticket is expired"
        elif ticket.status == TicketStatus.CHECKED_IN:
            state = ScanState.ALREADY_USED
            message = f"Already checked in at {ticket.checked_in_at}"
        else:
            state = ScanState.VALID
            message = "Entry allowed"
            ticket.status = TicketStatus.CHECKED_IN
            ticket.checked_in_at = now()
            ticket.checked_in_gate_id = payload.gate_id
            ticket.checked_in_by = payload.scanner_user_id
    log = ScanLog(
        id=new_id("scan"),
        event_id=ticket.event_id if ticket else payload.event_id,
        ticket_id=ticket.id if ticket else None,
        scanner_user_id=payload.scanner_user_id,
        gate_id=payload.gate_id,
        device_id=payload.device_id,
        scan_result=state,
        metadata={"message": message},
        scan_time=now(),
    )
    store.scan_logs.insert(0, log)
    log_audit("ticket.scanned", "scan", log.id, event_id=log.event_id, metadata={"result": state, "ticket_id": log.ticket_id})
    if state == ScanState.ALREADY_USED:
        log_audit("scan.duplicate_attempted", "ticket", ticket.id if ticket else "unknown", event_id=log.event_id)
    return {"status": state, "message": message, "ticket_id": log.ticket_id, "scanned_at": log.scan_time}


def manual_lookup(query: str) -> list:
    q = query.lower()
    return [
        ticket for ticket in store.tickets
        if q in ticket.id.lower()
        or q in ticket.attendee_name.lower()
        or q in ticket.attendee_phone.lower()
        or (ticket.attendee_email and q in ticket.attendee_email.lower())
    ]
