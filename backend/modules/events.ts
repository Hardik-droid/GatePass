import { createId } from "../core/ids";
import { getStore } from "../core/store";

export function listEvents() {
  return getStore().events;
}

export function getEventBySlug(slug: string) {
  return getStore().events.find((event) => event.slug === slug || event.id === slug);
}

export function createEvent(payload: Record<string, unknown>) {
  const event = {
    id: createId("evt"),
    organizationId: String(payload.organizationId ?? getStore().organizations[0]?.id ?? "org_demo"),
    slug: String(payload.slug ?? String(payload.title ?? "event").toLowerCase().replaceAll(" ", "-")),
    title: String(payload.title ?? "Untitled event"),
    description: String(payload.description ?? "New GatePass event"),
    eventType: String(payload.eventType ?? "public"),
    status: String(payload.status ?? "draft"),
    visibility: String(payload.visibility ?? "public"),
    venue: String(payload.venue ?? "Venue"),
    city: String(payload.city ?? "Mumbai"),
    startTime: String(payload.startTime ?? new Date().toISOString()),
    gpsRequired: Boolean(payload.gpsRequired ?? false),
  };
  getStore().events.push(event);
  return { event };
}

export function listTicketCategories(eventId?: string) {
  const categories = getStore().ticketCategories;
  return eventId ? categories.filter((category) => category.eventId === eventId) : categories;
}

export function createTicketCategory(payload: Record<string, unknown>) {
  const category = {
    id: createId("cat"),
    eventId: String(payload.eventId ?? getStore().events[0]?.id),
    name: String(payload.name ?? "General"),
    pricePaisa: Number(payload.pricePaisa ?? 0),
    capacity: Number(payload.capacity ?? 100),
  };
  getStore().ticketCategories.push(category);
  return { category };
}

export function publishEvent(id: string) {
  const event = getStore().events.find((entry) => entry.id === id);
  if (event) event.status = "live";
  return event;
}

export function updateEvent(id: string, payload: Record<string, unknown>) {
  const event = getStore().events.find((entry) => entry.id === id);
  if (event) Object.assign(event, payload);
  return event;
}
