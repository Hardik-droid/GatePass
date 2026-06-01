import { withErrorHandling } from "@/backend/core/http";
import { listTickets } from "@/backend/modules/tickets";

export async function GET() {
  return withErrorHandling(async () => ({ items: listTickets() }));
}
