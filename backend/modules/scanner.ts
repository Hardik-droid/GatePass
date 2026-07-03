import { createId, nowIso } from "../core/ids";
import { getStore, persistStoreRecord, persistStoreUpdate } from "../core/store";
import { getTicket } from "./tickets";
import { recordAudit } from "./audit";
import { verifyQrToken } from "./qr-service";

function normalizeTicketStatus(status: string | undefined) {
  if (!status) return "active";
  if (status === "issued") return "active";
  if (status === "checked_in") return "used";
  return status;
}

export async function validateScan(payload: Record<string, unknown>) {
  const store = getStore();
  const token = String(payload.qrToken ?? payload.ticketId ?? "");
  const verified = payload.qrToken ? verifyQrToken(token) : { valid: Boolean(token), ticketId: token, eventId: "" };

  // ── Ticket resolution (3-step, most-specific first) ──────────────────────
  const byQrToken = store.tickets.find((t) => t.qrToken === token);
  const byVerifiedId = verified.ticketId ? getTicket(verified.ticketId) : undefined;
  const byRawId = getTicket(token);
  const ticket = byQrToken ?? byVerifiedId ?? byRawId;
  const isValid = verified.valid || Boolean(byQrToken);

  const scanTime = nowIso();
  const logScan = async (scanResult: string, message: string) => {
    await persistStoreRecord("scanLogs", {
      id: createId("scan"),
      organizationId: ticket?.organizationId,
      eventId: ticket?.eventId,
      ticketId: ticket?.id ?? verified.ticketId ?? token,
      qrToken: token,
      scannerUserId: String(payload.scannerUserId ?? "usr_scanner_demo"),
      gateId: String(payload.gateId ?? "gate_main"),
      deviceId: String(payload.deviceId ?? "web"),
      scanResult,
      message,
      scanTime,
    });
  };

  const gateName = String(payload.gateId ?? "Main Gate");
  const deviceName = String(payload.deviceId ?? "web-scanner-01");
  const scannerUserId = String(payload.scannerUserId ?? "usr_scanner_demo");

  if (!ticket || !isValid) {
    await logScan("INVALID", "Ticket not found");
    return {
      success: false,
      valid: false,
      code: "NOT_FOUND",
      message: "Ticket not found",
    };
  }

  const event = store.events.find((e) => e.id === ticket.eventId);
  const category = store.ticketCategories.find((c) => c.id === ticket.ticketCategoryId);

  const attendeeName = String(ticket.attendeeName ?? ticket.userId ?? "—");
  const currentStatus = normalizeTicketStatus(String(ticket.status));

  const responseTicket = {
    id: ticket.id,
    orderId: ticket.orderId,
    eventId: ticket.eventId,
    eventName: event?.title ?? "Demo Event",
    eventStartAt: event?.startTime ?? ticket.createdAt,
    venue: event?.venue ?? "Main Ground",
    gateName: gateName,
    category: category?.name ?? "General",
    status: ticket.status,
    buyerName: ticket.attendeeName,
    buyerEmail: ticket.attendeeEmail,
    buyerPhone: ticket.attendeePhone,
    attendeeName: ticket.attendeeName,
    attendeeEmail: ticket.attendeeEmail,
    attendeePhone: ticket.attendeePhone,
    purchasedAt: ticket.createdAt || new Date().toISOString(),
    checkedInAt: ticket.scannedAt || ticket.checkedInAt || null,
    checkedInBy: ticket.scannedBy || ticket.checkedInBy || null,
    checkedInGate: ticket.checkedInGateId || null,
    checkedInDevice: deviceName,
  };

  if (["cancelled", "refunded", "expired"].includes(currentStatus)) {
    const result = currentStatus.toUpperCase();
    await logScan(result, `Ticket is ${currentStatus}`);
    recordAudit({ action: "wallet.qr.scan.rejected", entityType: "tickets", entityId: ticket.id, newValue: { result } });
    return {
      success: false,
      valid: false,
      code: result,
      message: `Ticket is ${currentStatus}`,
      ticket: responseTicket,
    };
  }

  if (currentStatus === "used") {
    await logScan("ALREADY USED", "Ticket already used");
    recordAudit({ action: "wallet.qr.scan.duplicate", entityType: "tickets", entityId: ticket.id });
    return {
      success: false,
      valid: false,
      code: "ALREADY_CHECKED_IN",
      message: "Ticket already used",
      ticket: responseTicket,
      audit: {
        scannedAt: ticket.scannedAt ?? ticket.checkedInAt ?? scanTime,
        scannerDevice: deviceName,
        gateName: gateName,
      },
    };
  }

  ticket.status = "used";
  ticket.scannedAt = scanTime;
  ticket.scannedBy = scannerUserId;
  ticket.checkedInAt = scanTime;
  ticket.checkedInGateId = gateName;
  ticket.checkedInBy = scannerUserId;

  await persistStoreUpdate("tickets", ticket);

  store.scanLogs.unshift({
    id: createId("scan"),
    organizationId: ticket.organizationId,
    eventId: ticket.eventId,
    ticketId: ticket.id,
    scannerUserId: scannerUserId,
    gateId: gateName,
    deviceId: deviceName,
    scanResult: "VALID",
    scanTime,
  });

  await logScan("VALID", "Entry allowed");
  recordAudit({ action: "wallet.qr.scanned", entityType: "tickets", entityId: ticket.id, newValue: { result: "VALID", deviceId: payload.deviceId } });

  responseTicket.status = "used";
  responseTicket.checkedInAt = scanTime;
  responseTicket.checkedInBy = scannerUserId;
  responseTicket.checkedInGate = gateName;

  return {
    success: true,
    valid: true,
    code: "VALID",
    message: "Entry allowed",
    ticket: responseTicket,
    audit: {
      scannedAt: scanTime,
      scannerDevice: deviceName,
      gateName: gateName,
    },
  };
}
