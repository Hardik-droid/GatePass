import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { getReports } from "@/backend/modules/reports";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "reports:read");
    const eventId = request.nextUrl.searchParams.get("eventId") ?? undefined;
    return getReports(eventId);
  });
}
