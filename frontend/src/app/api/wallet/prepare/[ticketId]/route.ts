import { withErrorHandling } from "@/backend/core/http";
import { requireTicketAccess } from "@/backend/modules/auth";
import { getTicket } from "@/backend/modules/tickets";
import { prepareWalletPasses } from "@/backend/modules/wallet-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  return withErrorHandling(async () => {
    const { ticketId } = await params;
    const ticket = getTicket(ticketId);
    await requireTicketAccess(ticket);
    return prepareWalletPasses(ticketId);
  });
}
