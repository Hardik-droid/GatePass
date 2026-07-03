import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { approveGatepassRequest } from "@/backend/modules/gps-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "dashboard:read");
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return { request: approveGatepassRequest(id, body.approved !== false) };
  });
}
