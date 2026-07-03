import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { handleManualOrder } from "@/backend/modules/orders";
import { isDevAuthEnabled } from "@/utils/supabase/env";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    if (!isDevAuthEnabled()) {
      await requireApiPermission(_request, "payments:write");
    }
    const { id } = await params;
    return handleManualOrder(id);
  });
}
