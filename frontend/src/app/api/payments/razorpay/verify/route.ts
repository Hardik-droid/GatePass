import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { razorpayVerifySchema } from "@/backend/core/schemas";
import { requireUser } from "@/backend/modules/auth";
import { verifyRazorpayPayment } from "@/backend/modules/payments";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireUser();
    const payload = await parseJson(request, razorpayVerifySchema);
    return verifyRazorpayPayment(payload);
  });
}
