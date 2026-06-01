import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { createOrUpdateEventTicketObject } from "@/backend/modules/google-wallet-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  return withErrorHandling(async () => {
    const { ticketId } = await params;
    const body = await request.json().catch(() => ({}));
    return createOrUpdateEventTicketObject(ticketId, String(body.qrToken ?? `token-${ticketId}`));
  });
}
