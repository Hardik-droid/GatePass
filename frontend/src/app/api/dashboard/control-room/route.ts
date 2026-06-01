import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { getDashboard } from "@/backend/modules/dashboard";
import { getStore } from "@/backend/core/store";
import { requireApiPermission } from "@/backend/modules/auth";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => ({
    ...requireApiPermission(request, "dashboard:read"),
    metrics: getDashboard(),
    liveScanFeed: getStore().scanLogs.slice(0, 25),
    gpsAlerts: getStore().gpsLocationLogs.filter((log) => log.status === "outside"),
  }));
}
