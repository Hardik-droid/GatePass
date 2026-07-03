import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { getDashboard } from "@/backend/modules/dashboard";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "dashboard:read");
    const eventId = request.nextUrl.searchParams.get("eventId") ?? undefined;
    return getDashboard(eventId);
  });
}
