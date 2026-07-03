import { NextRequest } from "next/server";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { paymentConfirmSchema, paymentCreateSchema } from "@/backend/core/schemas";
import { withIdempotency } from "@/backend/modules/idempotency";
import { requireApiPermission } from "@/backend/modules/auth";
import {
  confirmPayment,
  createPayment,
  listPayments,
} from "@/backend/modules/payments";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "payments:read");
    return { items: listPayments() };
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "payments:write");
    const action = request.nextUrl.searchParams.get("action") ?? "create";

    if (action === "confirm") {
      const payload = await parseJson(request, paymentConfirmSchema);
      return withIdempotency(
        "payment:confirm",
        getIdempotencyKey(request),
        () => confirmPayment(payload),
      );
    }

    const payload = await parseJson(request, paymentCreateSchema);
    return withIdempotency("payment:create", getIdempotencyKey(request), () =>
      createPayment(payload),
    );
  });
}
