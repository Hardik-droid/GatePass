import { createId, nowIso } from "../core/ids";
import { getStore } from "../core/store";
import { getTicket } from "./tickets";
import { recordAudit } from "./audit";
import { verifyQrToken } from "./qr-service";

export function validateScan(payload: Record<string, unknown>) {
  const store = getStore();
  const token = String(payload.qrToken ?? payload.ticketId ?? "");
  const verified = payload.qrToken ? verifyQrToken(token) : { valid: Boolean(token), ticketId: token };
  const ticket = getTicket(verified.ticketId || token) ?? store.tickets.find((entry) => entry.qrToken === token);
  if (!ticket || !verified.valid) return { status: "INVALID", message: "Ticket not found" };
  if (["cancelled", "refunded", "expired"].includes(String(ticket.status))) {
    const result = String(ticket.status).toUpperCase();
    recordAudit({ action: "wallet.qr.scan.rejected", entityType: "tickets", entityId: ticket.id, newValue: { result } });
    return { status: result, ticketId: ticket.id, message: `Ticket is ${ticket.status}` };
  }
  if (ticket.status === "checked_in") {
    recordAudit({ action: "wallet.qr.scan.duplicate", entityType: "tickets", entityId: ticket.id });
    return { status: "ALREADY USED", ticketId: ticket.id, checkedInAt: ticket.checkedInAt, gateName: "Main Gate", scannerStaffName: ticket.checkedInBy, deviceId: payload.deviceId, message: "Ticket already used" };
  }
  const timestamp = nowIso();
  ticket.status = "checked_in";
  ticket.checkedInAt = timestamp;
  ticket.checkedInGateId = String(payload.gateId ?? "gate_main");
  ticket.checkedInBy = String(payload.scannerUserId ?? "usr_scanner_demo");
  store.scanLogs.unshift({
    id: createId("scan"),
    organizationId: ticket.organizationId,
    eventId: ticket.eventId,
    ticketId: ticket.id,
    scannerUserId: ticket.checkedInBy,
    gateId: ticket.checkedInGateId,
    deviceId: String(payload.deviceId ?? "web"),
    scanResult: "VALID",
    scanTime: timestamp,
  });
  recordAudit({ action: "wallet.qr.scanned", entityType: "tickets", entityId: ticket.id, newValue: { result: "VALID", deviceId: payload.deviceId } });
  return { status: "VALID", ticketId: ticket.id, checkedInAt: timestamp, gateName: "Main Gate", message: "Entry allowed" };
}
