import { getStore } from "../core/store";
import { persistStoreUpdate } from "../core/store";
import { hashQrToken } from "./qr-service";

export function serializeTicket<T extends Record<string, unknown>>(ticket: T) {
  const { qrToken: _qrToken, qrTokenHash: _qrTokenHash, ...safeTicket } = ticket;
  return safeTicket;
}

export function listTickets() {
  return getStore().tickets;
}

export function listSafeTickets() {
  return getStore().tickets.map((ticket) => serializeTicket(ticket));
}

export function getTicket(id: string) {
  const tokenHash = id ? hashQrToken(id) : "";
  return getStore().tickets.find(
    (ticket) =>
      ticket.id === id ||
      ticket.ticketId === id ||
      ticket.qrToken === id ||
      ticket.qrTokenHash === tokenHash,
  );
}

export function getSafeTicket(id: string) {
  const ticket = getTicket(id);
  return ticket ? serializeTicket(ticket) : undefined;
}

export function getTicketsForUser(user: string | { email?: string; phone?: string } = "dev@gatepass.local") {
  const email = typeof user === "string" ? user : user.email;
  const phone = typeof user === "string" ? undefined : user.phone;
  return getStore().tickets.filter((ticket) => ticket.attendeeEmail === email || ticket.attendeePhone === phone || (!email && !phone));
}

export function getSafeTicketsForUser(user: string | { email?: string; phone?: string } = "dev@gatepass.local") {
  return getTicketsForUser(user).map((ticket) => serializeTicket(ticket));
}

export function cancelTicket(id: string) {
  const ticket = getTicket(id);
  if (ticket) {
    ticket.status = "cancelled";
    void persistStoreUpdate("tickets", ticket).catch((error) => console.error("Ticket cancel persistence failed", error));
  }
  return ticket;
}

export function getTicketBySecureToken(token: string) {
  return getTicket(token);
}

export function issueTicketsForOrder(order: Record<string, unknown>) {
  return { tickets: getStore().tickets, order };
}

export function refundMarkTicketInvalid(id: string) {
  const ticket = getTicket(id);
  if (ticket) {
    ticket.status = "refunded";
    void persistStoreUpdate("tickets", ticket).catch((error) => console.error("Ticket refund persistence failed", error));
  }
  return ticket;
}
