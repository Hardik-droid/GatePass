import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { HttpError, withErrorHandling } from "@/backend/core/http";
import { handleRazorpayWebhook } from "@/backend/modules/payments";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new HttpError(503, "Payment webhook is not configured");
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const valid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) throw new HttpError(400, "Invalid webhook signature");
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    return handleRazorpayWebhook(payload);
  });
}
