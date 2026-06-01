import { createId } from "../core/ids";
import { getStore } from "../core/store";

export function listPayments() {
  return getStore().payments;
}

export function createPayment(payload: Record<string, unknown>) {
  const payment = { id: createId("pay"), status: "created", ...payload };
  getStore().payments.push(payment);
  return { payment };
}

export function confirmPayment(payload: Record<string, unknown>) {
  const payment = { id: String(payload.paymentId ?? createId("pay")), status: "confirmed", ...payload };
  getStore().payments.push(payment);
  return { payment };
}

export function createRazorpayOrder(payload: Record<string, unknown>) {
  return { order: { id: createId("rzp_order"), currency: "INR", status: "created", ...payload } };
}

export function verifyRazorpayPayment(payload: Record<string, unknown>) {
  return { verified: true, payment: payload };
}

export function handleRazorpayWebhook(payload: Record<string, unknown>) {
  return { received: true, payment: payload };
}

export function devPaymentSimulator(payload: Record<string, unknown>) {
  return confirmPayment(payload);
}
