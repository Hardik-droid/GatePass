import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { createId, nowIso } from "@/backend/core/ids";
import { getStore } from "@/backend/core/store";
import { requireApiPermission } from "@/backend/modules/auth";
import { recordAudit } from "@/backend/modules/audit";
import { getTicket } from "@/backend/modules/tickets";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "scanner:validate");
    const body = await request.json();
    const ticket = getTicket(String(body.ticketId));
    if (!ticket) return { status: "INVALID", message: "Ticket not found" };
    if (ticket.status === "checked_in") {
      return {
        status: "ALREADY_USED",
        ticketId: ticket.id,
        checkedInAt: ticket.checkedInAt,
        message: `Already checked in at ${ticket.checkedInAt ?? "unknown time"}`,
      };
    }
    const timestamp = nowIso();
    ticket.status = "checked_in";
    ticket.checkedInAt = timestamp;
    ticket.checkedInGateId = String(body.gateId ?? "manual_gate");
    ticket.checkedInBy = String(body.scannerUserId ?? "usr_scanner_demo");
    getStore().scanLogs.unshift({
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
    });
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
