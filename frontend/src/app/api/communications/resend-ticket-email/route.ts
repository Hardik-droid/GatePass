import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { resendTicketConfirmation } from "@/backend/modules/notifications";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "notifications:write");
    const body = await request.json();
    return resendTicketConfirmation(String(body.ticketId));
  });
}
