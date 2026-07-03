import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { getSafeTicket } from "@/backend/modules/tickets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    await requireApiPermission(_request, "tickets:read");
    const { id } = await params;
    return { ticket: getSafeTicket(id) };
  });
}
