import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { gatepassRequestSchema } from "@/backend/core/schemas";
import { requireApiPermission } from "@/backend/modules/auth";
import { createGatepassRequest } from "@/backend/modules/gps-service";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "gatepass:request");
    const payload = await parseJson(request, gatepassRequestSchema);
    return { request: createGatepassRequest(payload) };
  });
}
