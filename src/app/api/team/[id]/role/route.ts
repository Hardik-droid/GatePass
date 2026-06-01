import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { getStore } from "@/backend/core/store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const member = getStore().organizationMembers.find((entry) => entry.id === id);
    if (member) member.role = body.role ?? member.role;
    return { member };
  });
}
