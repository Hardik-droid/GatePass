import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { gpsLocationSchema } from "@/backend/core/schemas";
import { logLocation } from "@/backend/modules/gps-service";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await parseJson(request, gpsLocationSchema);
    return { location: logLocation(payload) };
  });
}
