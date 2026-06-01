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

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "scanner:validate");
    const payload = await parseJson(request, scannerValidateSchema);
    return withIdempotency(
      "scanner:validate",
      getIdempotencyKey(request),
      () => validateScan(payload),
    );
  });
}
