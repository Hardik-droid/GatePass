import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { listAuditEvents } from "@/backend/modules/audit";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "dashboard:read");
    return { items: listAuditEvents() };
  });
}
