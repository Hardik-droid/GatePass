import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { generateGoogleWalletSaveUrl } from "@/backend/modules/google-wallet-service";
import { getTicket } from "@/backend/modules/tickets";
import { verifySignedWalletLinkToken } from "@/backend/modules/wallet-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  return withErrorHandling(async () => {
    const { ticketId } = await params;
    const signed = request.nextUrl.searchParams.get("token") ?? "";
    if (signed && !verifySignedWalletLinkToken(ticketId, "google", signed)) {
      throw new Error("Wallet link expired or invalid");
    }
    const qrToken = request.nextUrl.searchParams.get("qrToken") ?? getTicket(ticketId)?.qrToken ?? `token-${ticketId}`;
    return generateGoogleWalletSaveUrl(ticketId, qrToken);
  });
}
