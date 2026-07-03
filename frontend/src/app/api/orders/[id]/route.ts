import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { getOrder } from "@/backend/modules/orders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    await requireApiPermission(_request, "orders:read");
    const { id } = await params;
    return { order: getOrder(id) };
  });
}
