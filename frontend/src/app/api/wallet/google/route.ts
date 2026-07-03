import { NextRequest, NextResponse } from "next/server";
import { HttpError, withErrorHandling } from "@/backend/core/http";
import { requireTicketAccess } from "@/backend/modules/auth";
import { generateGoogleWalletSaveUrl } from "@/backend/modules/google-wallet-service";
import { getTicket } from "@/backend/modules/tickets";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const ticketId = String(body.ticketId ?? "");
    const ticket = getTicket(ticketId);
    await requireTicketAccess(ticket);
    if (!ticket?.qrToken) throw new HttpError(404, "QR token unavailable");
    return NextResponse.json(generateGoogleWalletSaveUrl(ticketId, ticket.qrToken));
  });
}
