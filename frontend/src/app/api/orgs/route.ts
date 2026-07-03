import { NextRequest } from "next/server";
import {
  getIdempotencyKey,
  parseJson,
  withErrorHandling,
} from "@/backend/core/http";
import { organizationCreateSchema } from "@/backend/core/schemas";
import { requireApiPermission } from "@/backend/modules/auth";
import { withIdempotency } from "@/backend/modules/idempotency";
import { createOrganization, listOrganizations } from "@/backend/modules/organizations";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "dashboard:read");
    return { items: listOrganizations() };
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "team:write");
    const payload = await parseJson(request, organizationCreateSchema);
    return withIdempotency("org:create", getIdempotencyKey(request), () =>
      createOrganization(payload),
    );
  });
}
