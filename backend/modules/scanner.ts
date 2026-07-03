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
  // Step 1: direct qrToken field match (exact signed payload stored at issue time)
  const byQrToken = store.tickets.find((t) => t.qrToken === token);
  // Step 2: verified payload ticket_id (from decoded HMAC token)
  const byVerifiedId = verified.ticketId ? getTicket(verified.ticketId) : undefined;
  // Step 3: raw input treated as ticket ID (manual entry fallback)
  const byRawId = getTicket(token);
  const ticket = byQrToken ?? byVerifiedId ?? byRawId;
  // Re-evaluate validity: if we found by qrToken match, token is implicitly valid
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

  if (!ticket || !isValid) {
    await logScan("INVALID", "Ticket not found");
    return { status: "INVALID", message: "Ticket not found", ticketId: token.length < 30 ? token : undefined };
  }

  const attendeeName = String(ticket.attendeeName ?? ticket.userId ?? "—");

  const currentStatus = normalizeTicketStatus(String(ticket.status));
  if (["cancelled", "refunded", "expired"].includes(currentStatus)) {
    const result = currentStatus.toUpperCase();
    await logScan(result, `Ticket is ${currentStatus}`);
    recordAudit({ action: "wallet.qr.scan.rejected", entityType: "tickets", entityId: ticket.id, newValue: { result } });
    return { status: result, ticketId: ticket.id, attendeeName, message: `Ticket is ${currentStatus}` };
  }

  if (currentStatus === "used") {
    await logScan("ALREADY USED", "Ticket already used");
    recordAudit({ action: "wallet.qr.scan.duplicate", entityType: "tickets", entityId: ticket.id });
    return {
      status: "ALREADY USED",
      ticketId: ticket.id,
      attendeeName,
      checkedInAt: ticket.scannedAt ?? ticket.checkedInAt,
      gateName: "Main Gate",
      scannerStaffName: ticket.scannedBy ?? ticket.checkedInBy,
      deviceId: payload.deviceId,
      message: "Ticket already used",
    };
  }

  ticket.status = "used";
  ticket.scannedAt = scanTime;
  ticket.scannedBy = String(payload.scannerUserId ?? "usr_scanner_demo");
  ticket.checkedInAt = scanTime;
  ticket.checkedInGateId = String(payload.gateId ?? "gate_main");
  ticket.checkedInBy = String(payload.scannerUserId ?? "usr_scanner_demo");

  await persistStoreUpdate("tickets", ticket);
  store.scanLogs.unshift({
    id: createId("scan"),
    organizationId: ticket.organizationId,
    eventId: ticket.eventId,
    ticketId: ticket.id,
    scannerUserId: String(payload.scannerUserId ?? "usr_scanner_demo"),
    gateId: String(payload.gateId ?? "gate_main"),
    deviceId: String(payload.deviceId ?? "web"),
    scanResult: "VALID",
    scanTime,
  });
  await logScan("VALID", "Entry allowed");
  recordAudit({ action: "wallet.qr.scanned", entityType: "tickets", entityId: ticket.id, newValue: { result: "VALID", deviceId: payload.deviceId } });
  return { status: "VALID", ticketId: ticket.id, attendeeName, checkedInAt: scanTime, gateName: "Main Gate", message: "Entry allowed" };
}
