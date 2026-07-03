import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { listSafeTickets } from "@/backend/modules/tickets";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "tickets:read");
    return { items: listSafeTickets() };
  });
}
