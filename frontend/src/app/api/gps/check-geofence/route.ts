import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { geofenceCheckSchema } from "@/backend/core/schemas";
import { requireApiPermission } from "@/backend/modules/auth";
import { checkGeofence } from "@/backend/modules/gps-service";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "gps:write");
    const payload = await parseJson(request, geofenceCheckSchema);
    return checkGeofence(payload);
  });
}
