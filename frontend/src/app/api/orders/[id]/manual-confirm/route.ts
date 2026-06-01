import { withErrorHandling } from "@/backend/core/http";
import { handleManualOrder } from "@/backend/modules/orders";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    return handleManualOrder(id);
  });
}
