import { NextRequest } from "next/server";
import { z } from "zod";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { withIdempotency } from "@/backend/modules/idempotency";
import { requireApiPermission } from "@/backend/modules/auth";
import {
  listNotifications,
  queueNotification,
} from "@/backend/modules/notifications";

const notificationSchema = z.object({
  organizationId: z.string().min(2),
  channel: z.enum(["email", "whatsapp"]),
  template: z.string().min(2),
  target: z.string().min(3),
});

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "notifications:read");
    return { items: listNotifications() };
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "notifications:write");
    const payload = await parseJson(request, notificationSchema);
    return withIdempotency(
      "notification:queue",
      getIdempotencyKey(request),
      () => queueNotification(payload),
    );
  });
}
