import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { createId, nowIso } from "@/backend/core/ids";
import { getStore } from "@/backend/core/store";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const orgId = String(body.organizationId ?? getStore().organizations[0]?.id);
    const member = {
      id: createId("member"),
      organizationId: orgId,
      userId: String(body.userId ?? body.email ?? "invited_user"),
      role: body.role ?? "VIEWER",
      permissions: body.permissions ?? [],
      createdAt: nowIso(),
    };
    getStore().organizationMembers.push(member);
    return { member };
  });
}
