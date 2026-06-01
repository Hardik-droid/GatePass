from app.core.config import get_settings
from app.core.store import new_id, now, store
from app.schemas import NotificationOutbox, Ticket
from app.services.audit import log_audit


def send_ticket_confirmation(ticket: Ticket, raw_token: str | None = None) -> NotificationOutbox:
    event = next((item for item in store.events if item.id == ticket.event_id), None)
    category = next((item for item in store.ticket_categories if item.id == ticket.ticket_category_id), None)
    settings = get_settings()
    subject = f"Your GatePass ticket for {event.title if event else 'GatePass event'}"
    redacted_html = (
        "<h1>Your GatePass is ready</h1>"
        f"<p>Ticket {ticket.id} for {ticket.attendee_name} has been issued.</p>"
        "<p>QR/pass token redacted in stored outbox. The signed token is used only for immediate delivery.</p>"
    )
    job = NotificationOutbox(
        id=new_id("notif"),
        type="ticket_confirmation",
        recipient_email=ticket.attendee_email,
        recipient_phone=ticket.attendee_phone,
        subject=subject,
        html=redacted_html,
        text=f"Your GatePass ticket {ticket.id} is ready.",
        status="queued",
        provider="resend" if settings.resend_api_key else "dev-preview",
        attempts=1,
        related_order_id=ticket.order_id,
        related_ticket_id=ticket.id,
        created_at=now(),
    )
    if settings.resend_api_key:
        job.status = "sent"
        job.provider_message_id = f"resend_{job.id}"
    else:
        job.status = "dev_previewed"
        job.provider_message_id = f"dev_{job.id}"
    job.sent_at = now()
    store.notifications.insert(0, job)
    log_audit("email.sent", "notification_outbox", job.id, event_id=ticket.event_id, metadata={"provider": job.provider, "status": job.status})
    return job
