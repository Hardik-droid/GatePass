import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { walletStatusSchema } from "@/backend/core/schemas";
import { requireTicketAccess } from "@/backend/modules/auth";
import { getTicket } from "@/backend/modules/tickets";
import { getWalletPass, syncWalletPassStatus } from "@/backend/modules/wallet-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ walletPassId: string }> },
) {
  return withErrorHandling(async () => {
    const { walletPassId } = await params;
    const body = await parseJson(request, walletStatusSchema);
    const pass = getWalletPass(walletPassId);
    if (!pass) throw new Error("Wallet pass not found");
    await requireTicketAccess(getTicket(pass.ticketId));
    return syncWalletPassStatus(pass.ticketId, body.status);
  });
}
