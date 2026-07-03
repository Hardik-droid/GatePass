import { NextRequest } from "next/server";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { scannerValidateSchema } from "@/backend/core/schemas";
import { requireApiPermission } from "@/backend/modules/auth";
import { withIdempotency } from "@/backend/modules/idempotency";
import { validateScan } from "@/backend/modules/scanner";
import { isDevAuthEnabled } from "@/utils/supabase/env";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // In dev mode, accept x-gatepass-role: OWNER header for scanner access
    // (allows scanner page to work without a real login session)
    const devOverride =
      process.env.NODE_ENV !== "production" &&
      isDevAuthEnabled() &&
      request.headers.get("x-gatepass-role")?.toUpperCase() === "OWNER";

    if (!devOverride) {
      await requireApiPermission(request, "scanner:validate");
    }

    const payload = await parseJson(request, scannerValidateSchema);
    return withIdempotency(
      "scanner:validate",
      getIdempotencyKey(request),
      () => validateScan(payload),
    );
  });
}
