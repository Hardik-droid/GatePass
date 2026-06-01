import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { razorpayCreateOrderSchema } from "@/backend/core/schemas";
import { createRazorpayOrder } from "@/backend/modules/payments";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await parseJson(request, razorpayCreateOrderSchema);
    return createRazorpayOrder(payload);
  });
}
