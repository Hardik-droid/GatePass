import { withErrorHandling } from "@/backend/core/http";
import { getStore } from "@/backend/core/store";
import { requireApiPermission } from "@/backend/modules/auth";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "team:read");
    return { items: getStore().organizationMembers };
  });
}
