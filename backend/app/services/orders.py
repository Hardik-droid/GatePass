from app.core.errors import invariant
from app.core.store import new_id, now, store
from app.schemas import Order, OrderCreate, OrderItem, OrderStatus, Payment, Ticket, TicketStatus, TicketToken
from app.services.audit import log_audit
from app.services.notifications import send_ticket_confirmation
from app.services.qr import create_secure_qr_token, hash_qr_token


def create_order(payload: OrderCreate) -> dict:
    invariant(any(event.id == payload.event_id for event in store.events), 404, "EVENT_NOT_FOUND", "Event not found")
    gross = 0
    items: list[OrderItem] = []
    order_id = new_id("ord")
    for item in payload.items:
        category = next((cat for cat in store.ticket_categories if cat.id == item.ticket_category_id), None)
        invariant(category is not None and category.event_id == payload.event_id, 404, "CATEGORY_NOT_FOUND", "Ticket category not found")
        gross += category.price_paisa * item.quantity
        items.append(OrderItem(id=new_id("item"), order_id=order_id, ticket_category_id=category.id, quantity=item.quantity, unit_price_paisa=category.price_paisa))
    platform_fee = int(gross * 0.03)
    gateway_fee = int(gross * 0.02)
    order = Order(
        id=order_id,
        organization_id=payload.organization_id,
        event_id=payload.event_id,
        buyer_name=payload.buyer_name,
        buyer_phone=payload.buyer_phone,
        buyer_email=payload.buyer_email,
        gross_amount_paisa=gross,
        platform_fee_paisa=platform_fee,
        gateway_fee_paisa=gateway_fee,
        net_amount_paisa=gross - platform_fee - gateway_fee,
        status=OrderStatus.PAYMENT_PENDING,
        created_at=now(),
    )
    store.orders.append(order)
    store.order_items.extend(items)
    log_audit("order.created", "order", order.id, organization_id=order.organization_id, event_id=order.event_id, metadata={"gross_amount_paisa": gross})
    return {"order": order, "items": items}


def mark_order_paid(order_id: str) -> Order:
    order = next((item for item in store.orders if item.id == order_id), None)
    invariant(order is not None, 404, "ORDER_NOT_FOUND", "Order not found")
    if order.status not in {OrderStatus.PAID, OrderStatus.TICKET_ISSUED}:
        order.status = OrderStatus.PAID
        order.payment_status = "paid"
    return order


def issue_tickets_for_paid_order(order_id: str) -> dict:
    order = mark_order_paid(order_id)
    existing = [ticket for ticket in store.tickets if ticket.order_id == order.id]
    if existing:
        return {"tickets": existing, "raw_tokens": []}
    tickets: list[Ticket] = []
    raw_tokens: list[str] = []
    for item in [entry for entry in store.order_items if entry.order_id == order.id]:
        category = next(cat for cat in store.ticket_categories if cat.id == item.ticket_category_id)
        category.sold_count += item.quantity
        for _ in range(item.quantity):
            ticket = Ticket(
                id=new_id("tkt"),
                organization_id=order.organization_id,
                event_id=order.event_id,
                order_id=order.id,
                ticket_category_id=item.ticket_category_id,
                attendee_name=order.buyer_name,
                attendee_phone=order.buyer_phone,
                attendee_email=order.buyer_email,
                status=TicketStatus.ISSUED,
                issued_at=now(),
                created_at=now(),
            )
            raw_token = create_secure_qr_token(ticket.event_id, ticket.id)
            store.tickets.append(ticket)
            store.ticket_tokens.append(TicketToken(id=new_id("tok"), ticket_id=ticket.id, event_id=ticket.event_id, token_hash=hash_qr_token(raw_token), created_at=now()))
            tickets.append(ticket)
            raw_tokens.append(raw_token)
            send_ticket_confirmation(ticket, raw_token)
    order.status = OrderStatus.TICKET_ISSUED
    log_audit("ticket.issued", "order", order.id, organization_id=order.organization_id, event_id=order.event_id, metadata={"count": len(tickets)})
    return {"tickets": tickets, "raw_tokens": raw_tokens}


def dev_payment_simulator(order_id: str) -> dict:
    order = mark_order_paid(order_id)
    payment = Payment(id=new_id("pay"), order_id=order.id, provider="dev_simulator", status="confirmed", amount_paisa=order.gross_amount_paisa, created_at=now())
    store.payments.append(payment)
    issued = issue_tickets_for_paid_order(order.id)
    log_audit("payment.confirmed", "payment", payment.id, organization_id=order.organization_id, event_id=order.event_id)
    return {"payment": payment, **issued}
