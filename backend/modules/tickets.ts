import { getStore } from "../core/store";
import { hashQrToken } from "./qr-service";

export function listTickets() {
  return getStore().tickets;
}

export function getTicket(id: string) {
  const tokenHash = id ? hashQrToken(id) : "";
  return getStore().tickets.find(
    (ticket) =>
      ticket.id === id ||
      ticket.qrToken === id ||
      ticket.qrTokenHash === tokenHash,
  );
}

export function getTicketsForUser(user: string | { email?: string; phone?: string } = "dev@gatepass.local") {
  const email = typeof user === "string" ? user : user.email;
  const phone = typeof user === "string" ? undefined : user.phone;
  return getStore().tickets.filter((ticket) => ticket.attendeeEmail === email || ticket.attendeePhone === phone || (!email && !phone));
}

export function cancelTicket(id: string) {
  const ticket = getTicket(id);
  if (ticket) ticket.status = "cancelled";
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
  if (ticket) ticket.status = "refunded";
  return ticket;
}
