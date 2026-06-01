from app.core.store import new_id, now, store
from app.schemas import ScanState


def dashboard_metrics(event_id: str | None = None) -> dict:
    orders = [item for item in store.orders if event_id is None or item.event_id == event_id]
    tickets = [item for item in store.tickets if event_id is None or item.event_id == event_id]
    scans = [item for item in store.scan_logs if event_id is None or item.event_id == event_id]
    paid = [order for order in orders if order.status in {"paid", "ticket_issued"}]
    return {
        "total_events": len(store.events),
        "active_events": len([event for event in store.events if event.status == "published"]),
        "sold_tickets": len(tickets),
        "checked_in_tickets": len([ticket for ticket in tickets if ticket.status == "checked_in"]),
        "unused_tickets": len([ticket for ticket in tickets if ticket.status == "issued"]),
        "revenue_paisa": sum(order.gross_amount_paisa for order in paid),
        "invalid_scans": len([scan for scan in scans if scan.scan_result == ScanState.INVALID]),
        "duplicate_scans": len([scan for scan in scans if scan.scan_result == ScanState.ALREADY_USED]),
        "gps_alerts": len([log for log in store.gps_location_logs if log.status == "outside"]),
    }


def reports(event_id: str | None = None) -> dict:
    orders = [item for item in store.orders if event_id is None or item.event_id == event_id]
    tickets = [item for item in store.tickets if event_id is None or item.event_id == event_id]
    return {
        "sales_rows": [
            {
                "order_id": order.id,
                "buyer": order.buyer_name,
                "event_id": order.event_id,
                "amount_paisa": order.gross_amount_paisa,
                "payment_mode": order.payment_mode,
                "status": order.status,
                "created_at": order.created_at,
            }
            for order in orders
        ],
        "attendance_rows": [
            {
                "ticket_id": ticket.id,
                "attendee": ticket.attendee_name,
                "category_id": ticket.ticket_category_id,
                "status": ticket.status,
                "checked_in_at": ticket.checked_in_at,
                "gate": ticket.checked_in_gate_id,
                "scanner": ticket.checked_in_by,
            }
            for ticket in tickets
        ],
    }


def settlement(event_id: str) -> dict:
    orders = [item for item in store.orders if item.event_id == event_id and item.status in {"paid", "ticket_issued"}]
    gross = sum(order.gross_amount_paisa for order in orders)
    platform = sum(order.platform_fee_paisa for order in orders)
    gateway = sum(order.gateway_fee_paisa for order in orders)
    manual = sum(order.gross_amount_paisa for order in orders if order.payment_mode == "manual")
    return {
        "id": new_id("stl"),
        "event_id": event_id,
        "gross_sales_paisa": gross,
        "total_refunds_paisa": 0,
        "platform_fees_paisa": platform,
        "gateway_fees_paisa": gateway,
        "manual_collections_paisa": manual,
        "net_settlement_paisa": gross - platform - gateway,
        "status": "pending",
        "created_at": now(),
    }
