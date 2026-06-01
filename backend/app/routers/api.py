from fastapi import APIRouter, Depends
from app.core.security import UserRole, require_permission, role_from_header
from app.core.store import store
from app.schemas import EventCreate, GatepassRequestCreate, GpsLocationCreate, OrderCreate, ScannerValidate, TicketCategoryCreate
from app.services.analytics import dashboard_metrics, reports, settlement
from app.services.events import create_event, create_ticket_category, get_event_by_slug, list_events, list_ticket_categories
from app.services.gps import create_gatepass_request, log_location
from app.services.orders import create_order, dev_payment_simulator
from app.services.scanner import manual_lookup, validate_scan

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "gatepass-fastapi"}


@router.get("/events")
def get_events() -> dict:
    return {"items": list_events()}


@router.post("/events")
def post_event(payload: EventCreate, role: UserRole = Depends(role_from_header)) -> dict:
    require_permission("events:write", role)
    return {"event": create_event(payload)}


@router.get("/events/{slug}")
def get_event(slug: str) -> dict:
    event = get_event_by_slug(slug)
    return {"event": event, "ticket_categories": list_ticket_categories(event.id) if event else []}


@router.post("/ticket-categories")
def post_ticket_category(payload: TicketCategoryCreate, role: UserRole = Depends(role_from_header)) -> dict:
    require_permission("tickets:write", role)
    return {"category": create_ticket_category(payload)}


@router.get("/ticket-categories")
def get_ticket_categories(event_id: str | None = None) -> dict:
    return {"items": list_ticket_categories(event_id)}


@router.post("/orders")
def post_order(payload: OrderCreate) -> dict:
    return create_order(payload)


@router.get("/orders")
def get_orders() -> dict:
    return {"items": store.orders}


@router.post("/orders/{order_id}/manual-confirm")
def manual_confirm(order_id: str) -> dict:
    return dev_payment_simulator(order_id)


@router.post("/payments/dev-simulator/{order_id}")
def post_dev_payment(order_id: str) -> dict:
    return dev_payment_simulator(order_id)


@router.post("/payments/razorpay/create-order")
def create_razorpay_order(order_id: str) -> dict:
    return {"mode": "razorpay" if False else "dev_simulator", "order_id": order_id}


@router.post("/scanner/validate")
def post_scan(payload: ScannerValidate, role: UserRole = Depends(role_from_header)) -> dict:
    require_permission("scanner:validate", role)
    return validate_scan(payload)


@router.post("/scanner/manual-lookup")
def post_manual_lookup(query: str, role: UserRole = Depends(role_from_header)) -> dict:
    require_permission("scanner:lookup", role)
    return {"items": manual_lookup(query)}


@router.get("/tickets")
def get_tickets() -> dict:
    return {"items": store.tickets}


@router.get("/me/tickets")
def get_my_tickets(email: str | None = None, phone: str | None = None) -> dict:
    return {
        "items": [
            ticket for ticket in store.tickets
            if (email and ticket.attendee_email == email) or (phone and ticket.attendee_phone == phone)
        ]
    }


@router.get("/dashboard")
def get_dashboard(event_id: str | None = None, role: UserRole = Depends(role_from_header)) -> dict:
    require_permission("dashboard:read", role)
    return dashboard_metrics(event_id)


@router.get("/reports")
def get_reports(event_id: str | None = None, role: UserRole = Depends(role_from_header)) -> dict:
    require_permission("reports:read", role)
    return reports(event_id)


@router.get("/settlements/{event_id}")
def get_settlement(event_id: str, role: UserRole = Depends(role_from_header)) -> dict:
    require_permission("settlements:read", role)
    return {"settlement": settlement(event_id)}


@router.get("/communications")
def get_communications() -> dict:
    return {"items": store.notifications}


@router.get("/audit")
def get_audit() -> dict:
    return {"items": store.audit_events}


@router.post("/gatepass/request")
def post_gatepass_request(payload: GatepassRequestCreate) -> dict:
    return {"request": create_gatepass_request(payload)}


@router.post("/gps/log-location")
def post_location(payload: GpsLocationCreate) -> dict:
    return {"location": log_location(payload)}
