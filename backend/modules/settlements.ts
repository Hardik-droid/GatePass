import { getStore } from "../core/store";

export function getSettlements(eventId?: string) {
  const tickets = eventId ? getStore().tickets.filter((ticket) => ticket.eventId === eventId) : getStore().tickets;
  return {
    eventId,
    grossPaisa: tickets.length * 29900,
    feesPaisa: tickets.length * 500,
    netPaisa: tickets.length * 29400,
    status: "approved",
  };
}
