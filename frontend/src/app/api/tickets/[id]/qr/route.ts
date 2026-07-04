import { HttpError, withErrorHandling } from "@/backend/core/http";
import { getSession, requireTicketAccess } from "@/backend/modules/auth";
import { generateQrSvgOrDataUrl } from "@/backend/modules/qr-service";
import { getTicket } from "@/backend/modules/tickets";
import { isDevAuthEnabled } from "@/utils/env";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const ticket = getTicket(id);
    if (!ticket) throw new HttpError(404, "Ticket not found");

    // In dev mode allow QR generation for any valid ticket (same posture as manual-confirm).
    // In production always enforce session ownership.
    if (isDevAuthEnabled()) {
      const session = await getSession();
      if (!session) {
        // Unauthenticated dev request: allow QR if ticket exists (just booked flow)
        const token = ticket.qrToken || "";
        if (!token) throw new HttpError(404, "QR token unavailable");
        return { qrDataUrl: await generateQrSvgOrDataUrl(token) };
      }
    }

    await requireTicketAccess(ticket);
    const token = ticket.qrToken || "";
    if (!token) throw new HttpError(404, "QR token unavailable");
    return { qrDataUrl: await generateQrSvgOrDataUrl(token) };
  });
}
