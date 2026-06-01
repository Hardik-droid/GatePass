import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { getStore } from "@/backend/core/store";
import { requireApiPermission } from "@/backend/modules/auth";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "dashboard:read");
    return { items: getStore().eventGates };
  });
}
