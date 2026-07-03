import { withErrorHandling } from "@/backend/core/http";
import { requireTicketAccess } from "@/backend/modules/auth";
import { getTicket } from "@/backend/modules/tickets";
import { generateApplePassDownloadUrl, getOrCreateAppleWalletPass } from "@/backend/modules/wallet-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  return withErrorHandling(async () => {
    const { ticketId } = await params;
    const ticket = getTicket(ticketId);
    await requireTicketAccess(ticket);
    const pass = getOrCreateAppleWalletPass(ticketId);
    pass.status = "link_generated";
    pass.saveUrl = generateApplePassDownloadUrl(ticketId);
    return { available: true, url: pass.saveUrl, status: pass.status, walletPassId: pass.id };
  });
}
