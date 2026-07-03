import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { createId, nowIso } from "@/backend/core/ids";
import { getStore, persistStoreRecord, persistStoreUpdate } from "@/backend/core/store";
import { requireApiPermission } from "@/backend/modules/auth";
import { recordAudit } from "@/backend/modules/audit";
import { getTicket } from "@/backend/modules/tickets";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "scanner:validate");
    const body = await request.json();
    const ticket = getTicket(String(body.ticketId));
    if (!ticket) return { status: "INVALID", message: "Ticket not found" };
    if (ticket.status === "used" || ticket.status === "checked_in") {
      return {
        status: "ALREADY_USED",
        ticketId: ticket.id,
        checkedInAt: ticket.scannedAt ?? ticket.checkedInAt,
        message: `Already checked in at ${ticket.scannedAt ?? ticket.checkedInAt ?? "unknown time"}`,
      };
    }
    const timestamp = nowIso();
    ticket.status = "used";
    ticket.scannedAt = timestamp;
    ticket.scannedBy = String(body.scannerUserId ?? "usr_scanner_demo");
    ticket.checkedInAt = timestamp;
    ticket.checkedInGateId = String(body.gateId ?? "manual_gate");
    ticket.checkedInBy = String(body.scannerUserId ?? "usr_scanner_demo");
    await persistStoreUpdate("tickets", ticket);
    const scanLog = {
      id: createId("scan"),
      regionId: "in-west",
      organizationId: ticket.organizationId,
      eventId: ticket.eventId,
      ticketId: ticket.id,
      scannerUserId: ticket.checkedInBy,
      gateId: ticket.checkedInGateId,
      deviceId: String(body.deviceId ?? "manual"),
      scanResult: "VALID",
      scanTime: timestamp,
      metadata: { manual: true },
    };
    getStore().scanLogs.unshift(scanLog);
    await persistStoreRecord("scanLogs", scanLog);
    recordAudit({
      actorUserId: ticket.checkedInBy,
      actorRole: "SCANNER_STAFF",
      action: "ticket.manual_checkin",
      entityType: "ticket",
      entityId: ticket.id,
      organizationId: ticket.organizationId,
      eventId: ticket.eventId,
      metadata: {
        gateId: ticket.checkedInGateId,
        checkedInAt: timestamp,
      },
    });
    return { status: "VALID", ticketId: ticket.id, checkedInAt: timestamp };
  });
}
