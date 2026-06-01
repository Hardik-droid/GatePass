import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { listTickets } from "@/backend/modules/tickets";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "scanner:lookup");
    const body = await request.json();
    const query = String(body.query ?? "").toLowerCase();
    return {
      items: listTickets().filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(query) ||
          ticket.attendeeName.toLowerCase().includes(query) ||
          ticket.attendeePhone.includes(query) ||
          ticket.attendeeEmail?.toLowerCase().includes(query),
      ),
    };
  });
}
