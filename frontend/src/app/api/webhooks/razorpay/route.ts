import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { paymentConfirmSchema } from "@/backend/core/schemas";
import { handleRazorpayWebhook } from "@/backend/modules/payments";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await parseJson(request, paymentConfirmSchema);
    return handleRazorpayWebhook(payload);
  });
}
