import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { razorpayVerifySchema } from "@/backend/core/schemas";
import { verifyRazorpayPayment } from "@/backend/modules/payments";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await parseJson(request, razorpayVerifySchema);
    return verifyRazorpayPayment(payload);
  });
}
