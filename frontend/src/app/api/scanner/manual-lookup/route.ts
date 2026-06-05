import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { getTicket, listTickets } from "@/backend/modules/tickets";

function normalizeLookupQuery(value: unknown) {
  return String(value ?? "").trim();
}

function compactLookupQuery(value: string) {
  return value.replace(/\s+/g, "");
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "scanner:lookup");
    const body = await request.json();
    const rawQuery = normalizeLookupQuery(body.query);
    const compactQuery = compactLookupQuery(rawQuery);
    const query = rawQuery.toLowerCase();

    const directTicket = getTicket(compactQuery);
    if (directTicket) {
      return { items: [directTicket] };
    }

    return {
      items: listTickets().filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(query) ||
          ticket.attendeeName.toLowerCase().includes(query) ||
          ticket.attendeePhone.includes(query) ||
          ticket.attendeeEmail?.toLowerCase().includes(query) ||
          compactLookupQuery(String(ticket.qrToken ?? "")) === compactQuery,
      ),
    };
  });
}
