import { NextRequest } from "next/server";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { ticketCategoryCreateSchema } from "@/backend/core/schemas";
import { requireApiPermission } from "@/backend/modules/auth";
import {
  createTicketCategory,
  listTicketCategories,
} from "@/backend/modules/events";
import { withIdempotency } from "@/backend/modules/idempotency";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const eventId = request.nextUrl.searchParams.get("eventId") ?? undefined;
    return { items: listTicketCategories(eventId) };
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "tickets:write");
    const payload = await parseJson(request, ticketCategoryCreateSchema);
    return withIdempotency(
      "ticket-category:create",
      getIdempotencyKey(request),
      () => createTicketCategory(payload),
    );
  });
}
