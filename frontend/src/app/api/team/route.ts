import { withErrorHandling } from "@/backend/core/http";
import { getStore } from "@/backend/core/store";

export async function GET() {
  return withErrorHandling(async () => ({ items: getStore().organizationMembers }));
}
