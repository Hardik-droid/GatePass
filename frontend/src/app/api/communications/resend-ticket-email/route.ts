import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { resendTicketConfirmation } from "@/backend/modules/notifications";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    return resendTicketConfirmation(String(body.ticketId));
  });
}
