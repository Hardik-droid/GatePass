import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { listTickets, serializeTicket } from "@/backend/modules/tickets";
import { isDevAuthEnabled } from "@/utils/supabase/env";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const devOverride =
      process.env.NODE_ENV !== "production" &&
      isDevAuthEnabled() &&
      request.headers.get("x-gatepass-role")?.toUpperCase() === "OWNER";

    if (!devOverride) {
      await requireApiPermission(request, "scanner:lookup");
    }

    const body = await request.json();
    const query = String(body.query ?? "").toLowerCase().trim();
    return {
      items: listTickets()
        .filter(
          (ticket) =>
            ticket.id.toLowerCase().includes(query) ||
            String(ticket.attendeeName ?? "").toLowerCase().includes(query) ||
            String(ticket.attendeePhone ?? "").includes(query) ||
            String(ticket.attendeeEmail ?? "").toLowerCase().includes(query) ||
            String(ticket.orderId ?? "").toLowerCase().includes(query),
        )
        .map((ticket) => serializeTicket(ticket)),
    };
  });
}
