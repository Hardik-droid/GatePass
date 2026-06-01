import { withErrorHandling } from "@/backend/core/http";
import { getTicket } from "@/backend/modules/tickets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    return { ticket: getTicket(id) };
  });
}
