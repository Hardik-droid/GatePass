import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { getSettlements } from "@/backend/modules/settlements";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "settlements:read");
    const { eventId } = await params;
    return { settlement: getSettlements(eventId) };
  });
}
