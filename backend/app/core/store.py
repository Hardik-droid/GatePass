from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from uuid import uuid4
from app.schemas import (
    AuditEvent,
    Event,
    EventStatus,
    Geofence,
    GpsLocationLog,
    GatepassRequest,
    NotificationOutbox,
    Order,
    OrderItem,
    Organization,
    Payment,
    ScanLog,
    Ticket,
    TicketCategory,
    TicketToken,
    Visibility,
)


def now() -> datetime:
    return datetime.now(UTC)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"


@dataclass
class Store:
    organizations: list[Organization] = field(default_factory=list)
    events: list[Event] = field(default_factory=list)
    ticket_categories: list[TicketCategory] = field(default_factory=list)
    orders: list[Order] = field(default_factory=list)
    order_items: list[OrderItem] = field(default_factory=list)
    payments: list[Payment] = field(default_factory=list)
    tickets: list[Ticket] = field(default_factory=list)
    ticket_tokens: list[TicketToken] = field(default_factory=list)
    scan_logs: list[ScanLog] = field(default_factory=list)
    notifications: list[NotificationOutbox] = field(default_factory=list)
    audit_events: list[AuditEvent] = field(default_factory=list)
    gatepass_requests: list[GatepassRequest] = field(default_factory=list)
    gps_location_logs: list[GpsLocationLog] = field(default_factory=list)
    idempotency: dict[str, object] = field(default_factory=dict)


def _seed_store() -> Store:
    store = Store()
    org = Organization(
        id=new_id("org"),
        name="GatePass Demo Org",
        type="education",
        owner_user_id="usr_owner_demo",
        contact_email="ops@gatepass.local",
        contact_phone="+911234567890",
        created_at=now(),
    )
    store.organizations.append(org)

    seed_events = [
        ("The Gilded Evening", "luxury-evening", "luxury", "The Grand Hall", "Mumbai", 900, False),
        ("Neon Afterhours", "neon-afterhours", "party", "Warehouse 27", "Bengaluru", 1200, False),
        ("Monsoon Live", "monsoon-live", "concert", "Phoenix Arena", "Pune", 2500, False),
        ("Campus Nova Live", "campus-nova-live", "concert", "Main Auditorium", "Delhi", 1800, False),
        ("Harbor Hostel Gate Pass", "harbor-hostel-gate-pass", "hostel_gate_pass", "Hostel Main Gate", "Mumbai", 5000, True),
    ]
    for index, (title, slug, event_type, venue, city, capacity, gps_required) in enumerate(seed_events):
        event = Event(
            id=new_id("evt"),
            organization_id=org.id,
            title=title,
            slug=slug,
            description=f"{title} is powered by GatePass secure booking, QR entry, live gates, and settlement reporting.",
            event_type=event_type,
            venue=venue,
            city=city,
            start_time=now() + timedelta(days=index + 1),
            end_time=now() + timedelta(days=index + 1, hours=6),
            status=EventStatus.PUBLISHED,
            visibility=Visibility.PUBLIC,
            capacity=capacity,
            gps_required=gps_required,
            geofence=Geofence(center_lat=19.076, center_lng=72.8777, radius_meters=2500 if gps_required else 250),
            created_at=now(),
        )
        store.events.append(event)
        store.ticket_categories.extend(
            [
                TicketCategory(
                    id=new_id("cat"),
                    organization_id=org.id,
                    event_id=event.id,
                    name="General",
                    price_paisa=[49900, 79900, 99900, 29900, 19900][index],
                    capacity=int(capacity * 0.75),
                    created_at=now(),
                ),
                TicketCategory(
                    id=new_id("cat"),
                    organization_id=org.id,
                    event_id=event.id,
                    name="Runner Kit" if gps_required else "VIP",
                    price_paisa=[149900, 199900, 249900, 99900, 49900][index],
                    capacity=int(capacity * 0.15),
                    created_at=now(),
                ),
            ]
        )
    return store


store = _seed_store()
