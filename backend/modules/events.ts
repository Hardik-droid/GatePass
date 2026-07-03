import { createId } from "../core/ids";
import { getStore, persistStoreRecord, persistStoreUpdate } from "../core/store";

export type EventRecord = {
  id: string;
  organizationId: string;
  slug: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  visibility: string;
  venue: string;
  city: string;
  startTime: string;
  gpsRequired: boolean;
  [key: string]: unknown;
};

export type TicketCategoryRecord = {
  id: string;
  eventId: string;
  name: string;
  pricePaisa: number;
  capacity: number;
  [key: string]: unknown;
};

export function listEvents() {
  return getStore().events as EventRecord[];
}

export function getEventBySlug(slug: string) {
  return getStore().events.find((event) => event.slug === slug || event.id === slug) as EventRecord | undefined;
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
  void persistStoreRecord("events", event).catch((error) => console.error("Event persistence failed", error));
  return { event };
}

export function listTicketCategories(eventId?: string) {
  const categories = getStore().ticketCategories;
  return (eventId ? categories.filter((category) => category.eventId === eventId) : categories) as TicketCategoryRecord[];
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
  void persistStoreRecord("ticketCategories", category).catch((error) => console.error("Ticket category persistence failed", error));
  return { category };
}

export function publishEvent(id: string) {
  const event = getStore().events.find((entry) => entry.id === id) as EventRecord | undefined;
  if (event) event.status = "live";
  if (event) {
    void persistStoreUpdate("events", event).catch((error) => console.error("Event publish persistence failed", error));
  }
  return event;
}

export function updateEvent(id: string, payload: Record<string, unknown>) {
  const event = getStore().events.find((entry) => entry.id === id) as EventRecord | undefined;
  if (event) Object.assign(event, payload);
  if (event) {
    void persistStoreUpdate("events", event).catch((error) => console.error("Event update persistence failed", error));
  }
  return event;
}
