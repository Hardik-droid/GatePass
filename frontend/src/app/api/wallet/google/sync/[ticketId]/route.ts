import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireTicketAccess } from "@/backend/modules/auth";
import { createOrUpdateEventTicketObject } from "@/backend/modules/google-wallet-service";
import { getTicket } from "@/backend/modules/tickets";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  return withErrorHandling(async () => {
    const { ticketId } = await params;
    const ticket = getTicket(ticketId);
    await requireTicketAccess(ticket);
    if (!ticket?.qrToken) throw new Error("QR token unavailable");
    return createOrUpdateEventTicketObject(ticketId, ticket.qrToken);
  });
}
