import { withErrorHandling } from "@/backend/core/http";
import { requireUser } from "@/backend/modules/auth";
import { getSafeTicketsForUser } from "@/backend/modules/tickets";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    return { items: getSafeTicketsForUser({ email: user.email }) };
  });
}
