import { NextRequest } from "next/server";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { orderCreateSchema } from "@/backend/core/schemas";
import { withIdempotency } from "@/backend/modules/idempotency";
import { createOrder, listOrders } from "@/backend/modules/orders";
import { requireApiPermission, requireUser } from "@/backend/modules/auth";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "orders:read");
    return { items: listOrders() };
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const payload = await parseJson(request, orderCreateSchema);
    return withIdempotency("order:create", getIdempotencyKey(request), () =>
      createOrder({ ...payload, buyerUserId: user.userId, buyerEmail: user.email || payload.buyerEmail }),
    );
  });
}
