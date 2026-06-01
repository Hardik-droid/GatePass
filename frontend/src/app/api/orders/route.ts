import { NextRequest } from "next/server";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { orderCreateSchema } from "@/backend/core/schemas";
import { withIdempotency } from "@/backend/modules/idempotency";
import { createOrder, listOrders } from "@/backend/modules/orders";

export async function GET() {
  return withErrorHandling(async () => ({ items: listOrders() }));
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await parseJson(request, orderCreateSchema);
    return withIdempotency("order:create", getIdempotencyKey(request), () =>
      createOrder(payload),
    );
  });
}
