import { z } from "zod";

export const organizationCreateSchema = z.object({ name: z.string().default("GatePass Org") }).passthrough();
export const eventCreateSchema = z.object({ title: z.string().default("Untitled event") }).passthrough();
export const ticketCategoryCreateSchema = z.object({ eventId: z.string().optional(), name: z.string().default("General"), pricePaisa: z.number().default(0) }).passthrough();
export const orderCreateSchema = z.object({
  organizationId: z.string(),
  eventId: z.string(),
  buyerName: z.string().trim().min(2).max(120),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),
  items: z.array(z.object({ ticketCategoryId: z.string(), quantity: z.number().int().min(1).max(6) })).min(1).max(10),
}).passthrough();
export const paymentCreateSchema = z.object({ orderId: z.string().optional(), amountPaisa: z.number().optional() }).passthrough();
export const paymentConfirmSchema = z.object({ orderId: z.string().min(2), paymentId: z.string().min(2) }).passthrough();
export const razorpayCreateOrderSchema = z.object({ orderId: z.string().min(2), currency: z.string().default("INR") }).passthrough();
export const razorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(2),
  razorpay_payment_id: z.string().min(2),
  razorpay_signature: z.string().min(20),
  orderId: z.string().min(2).optional(),
}).passthrough();
export const scannerValidateSchema = z.object({
  qrToken: z.string().min(10).optional(),
  ticketId: z.string().min(2).optional(),
}).refine((value) => Boolean(value.qrToken || value.ticketId), "QR token or ticket ID is required");
export const gatepassRequestSchema = z.record(z.string(), z.unknown());
export const gpsLocationSchema = z.object({ latitude: z.number().optional(), longitude: z.number().optional() }).passthrough();
export const geofenceCheckSchema = z.object({ latitude: z.number().optional(), longitude: z.number().optional() }).passthrough();
export const authEmailSchema = z.object({
  mode: z.enum(["login", "signup"]),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  redirectTo: z.string().optional(),
});
export const walletPreferenceSchema = z.object({
  wallet_preference: z.enum(["apple", "google", "ask", "none"]),
});
export const walletStatusSchema = z.object({
  status: z.enum(["save_started", "active", "failed", "voided"]),
});
