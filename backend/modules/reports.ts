import { getStore } from "../core/store";

export function getReports(eventId?: string) {
  const store = getStore();
  void eventId;
  const salesRows = store.tickets.map((ticket) => ({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    attendee: ticket.attendeeName,
    status: ticket.status,
  }));
  const attendanceRows = store.scanLogs.map((scan) => ({
    ticketId: scan.ticketId,
    eventId: scan.eventId,
    scanResult: scan.scanResult,
    scanTime: scan.scanTime,
  }));
  return { salesRows, attendanceRows };
}

export function exportCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","));
  }
  return lines.join("\n");
}
