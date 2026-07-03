import crypto from "node:crypto";
import { createId } from "../core/ids";
import { HttpError } from "../core/http";
import { getStore, persistStoreRecord } from "../core/store";
import { getOrder, issueTicketsForPaidOrder, markOrderFailed, markOrderPaid } from "./orders";

export function listPayments() {
  return getStore().payments;
}

export function createPayment(payload: Record<string, unknown>) {
  const payment = { id: createId("pay"), status: "created", ...payload };
  getStore().payments.push(payment);
  void persistStoreRecord("payments", payment).catch((error) => console.error("Payment persistence failed", error));
  return { payment };
}

export function confirmPayment(payload: Record<string, unknown>) {
  const payment = { id: String(payload.paymentId ?? createId("pay")), status: "confirmed", ...payload };
  getStore().payments.push(payment);
  void persistStoreRecord("payments", payment).catch((error) => console.error("Payment confirmation persistence failed", error));
  return { payment };
}

export function createRazorpayOrder(payload: Record<string, unknown>) {
  const orderId = String(payload.orderId ?? "");
  const order = getOrder(orderId);
  if (!order) throw new HttpError(404, "Order not found");
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(503, "Payment gateway is not configured");
    }
    return {
      order: {
        id: `dev_rzp_${order.id}`,
        receipt: order.id,
        amount: Number(order.totalPaisa ?? 0),
        currency: String(payload.currency ?? "INR"),
        status: "created",
      },
    };
  }
  return {
    order: {
      id: createId("rzp_order"),
      receipt: order.id,
      amount: Number(order.totalPaisa ?? 0),
      currency: String(payload.currency ?? "INR"),
      status: "created",
    },
  };
}

export function verifyRazorpayPayment(payload: Record<string, unknown>) {
  const gatewayOrderId = String(payload.razorpay_order_id ?? "");
  const paymentId = String(payload.razorpay_payment_id ?? "");
  const signature = String(payload.razorpay_signature ?? "");
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new HttpError(503, "Payment gateway is not configured");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${gatewayOrderId}|${paymentId}`)
    .digest("hex");
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) throw new HttpError(400, "Invalid payment signature");
  const internalOrderId = String(payload.orderId ?? "");
  const order = internalOrderId ? markOrderPaid(internalOrderId) : undefined;
  const payment = confirmPayment({
    orderId: internalOrderId,
    paymentId,
    gatewayOrderId,
    provider: "razorpay",
    status: "confirmed",
  }).payment;
  const issued = order ? issueTicketsForPaidOrder(order.id) : undefined;
  return { verified: true, payment, order, tickets: issued?.tickets ?? [] };
}

export function handleRazorpayWebhook(payload: Record<string, unknown>) {
  const event = String(payload.event ?? "");
  const webhookPayload = payload.payload as
    | { payment?: { entity?: { notes?: { orderId?: unknown } } } }
    | undefined;
  const orderId = String(webhookPayload?.payment?.entity?.notes?.orderId ?? payload.orderId ?? "");
  if (event === "payment.failed" && orderId) markOrderFailed(orderId);
  if (event === "payment.captured" && orderId) {
    markOrderPaid(orderId);
    issueTicketsForPaidOrder(orderId);
  }
  return { received: true };
}

export function devPaymentSimulator(payload: Record<string, unknown>) {
  return confirmPayment(payload);
}
