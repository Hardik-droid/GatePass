import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { listTickets, serializeTicket } from "@/backend/modules/tickets";
import { getStore } from "@/backend/core/store";
import { isDevAuthEnabled } from "@/utils/env";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const devOverride =
      isDevAuthEnabled() &&
      request.headers.get("x-gatepass-role")?.toUpperCase() === "OWNER";

    if (!devOverride) {
      await requireApiPermission(request, "scanner:lookup");
    }

    const body = await request.json();
    const query = String(body.query ?? "").toLowerCase().trim();
    const store = getStore();
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
        .map((ticket) => {
          const event = store.events.find((e) => e.id === ticket.eventId);
          const category = store.ticketCategories.find((c) => c.id === ticket.ticketCategoryId);
          return {
            ...serializeTicket(ticket),
            eventName: event?.title ?? "Demo Event",
            categoryName: category?.name ?? "General",
          };
        }),
    };
  });
}
