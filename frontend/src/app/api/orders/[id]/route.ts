import { withErrorHandling } from "@/backend/core/http";
import { getOrder } from "@/backend/modules/orders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    return { order: getOrder(id) };
  });
}
