import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { createId, nowIso } from "@/backend/core/ids";
import { ensureStoreReady, persistStoreRecord } from "@/backend/core/store";
import { createSecureQrToken, hashQrToken } from "@/backend/modules/qr-service";
import { serializeTicket } from "@/backend/modules/tickets";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const store = await ensureStoreReady();
    const body = await req.json();
    const { email, eventId, paymentId, purchaseId, name, phone, ticketCategoryId } = body;

    if (!email || !eventId) {
      return NextResponse.json(
        { ok: false, reason: "email_and_eventId_required" },
        { status: 400 },
      );
    }

    const event = store.events.find((item) => item.id === eventId);
    if (!event) {
      return NextResponse.json(
        { ok: false, reason: "event_not_found" },
        { status: 404 },
      );
    }

    const category =
      store.ticketCategories.find((item) => item.id === ticketCategoryId && item.eventId === eventId) ??
      store.ticketCategories.find((item) => item.eventId === eventId);
    const ticketId = createId("tck").toUpperCase();
    const qrPayload = createSecureQrToken(ticketId, eventId);
    const issuedAt = nowIso();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const attendeeName = String(name || email.split("@")[0] || "Guest");
    const ticket = {
      id: ticketId,
      ticketId,
      orderId: String(purchaseId || paymentId || ""),
      userId: String(email),
      organizationId: String(event.organizationId ?? store.organizations[0]?.id ?? ""),
      eventId: String(eventId),
      ticketCategoryId: String(category?.id ?? ""),
      attendeeName,
      attendeeEmail: String(email),
      attendeePhone: String(phone ?? ""),
      email: String(email),
      status: "active",
      checkedInAt: "",
      checkedInGateId: "",
      checkedInBy: "",
      scannedAt: "",
      scannedBy: "",
      qrToken: qrPayload,
      qrTokenHash: hashQrToken(qrPayload),
      walletEnabled: true,
      appleWalletPassId: "",
      googleWalletPassId: "",
      walletLastUpdatedAt: "",
      createdAt: issuedAt,
      expiresAt,
      paymentId: String(paymentId || "local-test-payment"),
      purchaseId: String(purchaseId || "local-test-purchase"),
    };

    await persistStoreRecord("tickets", ticket);

    const qrImageDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
    });

    return NextResponse.json({
      ok: true,
      ticket: serializeTicket(ticket),
      qrPayload,
      qrImageDataUrl,
    });
  } catch (error) {
    console.error("ISSUE_TICKET_ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
