import { describe, expect, test } from "vitest";
import { verifyRazorpayPayment } from "@/backend/modules/payments";
import { serializeTicket } from "@/backend/modules/tickets";

describe("security flow guards", () => {
  test("does not verify Razorpay payments when the gateway secret is missing", () => {
    const original = process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_KEY_SECRET;

    expect(() =>
      verifyRazorpayPayment({
        razorpay_order_id: "order_fake",
        razorpay_payment_id: "pay_fake",
        razorpay_signature: "invalid_signature_value",
      }),
    ).toThrow("Payment gateway is not configured");

    if (original === undefined) {
      delete process.env.RAZORPAY_KEY_SECRET;
    } else {
      process.env.RAZORPAY_KEY_SECRET = original;
    }
  });

  test("does not serialize raw QR token material in ticket API DTOs", () => {
    const safeTicket = serializeTicket({
      id: "TCK_TEST",
      attendeeEmail: "qa@example.com",
      qrToken: "raw-token",
      qrTokenHash: "hash-token",
    });

    expect(safeTicket).toEqual({
      id: "TCK_TEST",
      attendeeEmail: "qa@example.com",
    });
  });
});
