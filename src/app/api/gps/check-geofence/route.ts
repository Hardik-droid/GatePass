import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { geofenceCheckSchema } from "@/backend/core/schemas";
import { checkGeofence } from "@/backend/modules/gps-service";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await parseJson(request, geofenceCheckSchema);
    return checkGeofence(payload);
  });
}
