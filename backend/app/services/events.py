import re
from app.core.errors import invariant
from app.core.store import new_id, now, store
from app.schemas import Event, EventCreate, EventStatus, TicketCategory, TicketCategoryCreate
from app.services.audit import log_audit


def slugify(title: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", title.lower()))


def list_events() -> list[Event]:
    return store.events


def get_event_by_slug(slug: str) -> Event | None:
    return next((event for event in store.events if event.slug == slug or event.id == slug), None)


def create_event(payload: EventCreate) -> Event:
    invariant(any(org.id == payload.organization_id for org in store.organizations), 404, "ORGANIZATION_NOT_FOUND", "Organization not found")
    event = Event(
        id=new_id("evt"),
        organization_id=payload.organization_id,
        title=payload.title,
        slug=slugify(payload.title),
        description=payload.description,
        event_type=payload.event_type,
        venue=payload.venue,
        city=payload.city,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=EventStatus.DRAFT,
        visibility=payload.visibility,
        capacity=payload.capacity,
        created_at=now(),
    )
    store.events.append(event)
    log_audit("event.created", "event", event.id, organization_id=event.organization_id, event_id=event.id)
    return event


def list_ticket_categories(event_id: str | None = None) -> list[TicketCategory]:
    return [cat for cat in store.ticket_categories if event_id is None or cat.event_id == event_id]


def create_ticket_category(payload: TicketCategoryCreate) -> TicketCategory:
    invariant(any(event.id == payload.event_id for event in store.events), 404, "EVENT_NOT_FOUND", "Event not found")
    category = TicketCategory(
        id=new_id("cat"),
        organization_id=payload.organization_id,
        event_id=payload.event_id,
        name=payload.name,
        price_paisa=payload.price_paisa,
        capacity=payload.capacity,
        created_at=now(),
    )
    store.ticket_categories.append(category)
    log_audit("ticket_category.created", "ticket_category", category.id, organization_id=category.organization_id, event_id=category.event_id)
    return category
