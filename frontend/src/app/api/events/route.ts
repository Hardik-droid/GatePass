import { NextRequest } from "next/server";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { eventCreateSchema } from "@/backend/core/schemas";
import { requireApiPermission } from "@/backend/modules/auth";
import { listEvents, createEvent } from "@/backend/modules/events";
import { withIdempotency } from "@/backend/modules/idempotency";

export async function GET() {
  return withErrorHandling(async () => ({ items: listEvents() }));
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "events:write");
    const payload = await parseJson(request, eventCreateSchema);
    return withIdempotency("event:create", getIdempotencyKey(request), () =>
      createEvent(payload),
    );
  });
}
