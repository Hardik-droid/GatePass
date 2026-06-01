import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { prepareWalletPasses } from "@/backend/modules/wallet-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  return withErrorHandling(async () => {
    const { ticketId } = await params;
    const body = await request.json().catch(() => ({}));
    return prepareWalletPasses(ticketId, { rawToken: body.qrToken });
  });
}
