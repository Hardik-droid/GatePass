import { getStore } from "../core/store";

export function getDashboard(eventId?: string) {
  const store = getStore();
  void eventId;
  const isUsed = (status: string) => ["used", "checked_in"].includes(status);
  return {
    totalEvents: store.events.length,
    activeEvents: store.events.filter((event) => event.status === "live").length,
    soldTickets: store.tickets.length,
    checkedInTickets: store.tickets.filter((ticket) => isUsed(String(ticket.status))).length,
    unusedTickets: store.tickets.filter((ticket) => !isUsed(String(ticket.status))).length,
    manualTickets: 0,
    revenuePaisa: store.tickets.length * 29900,
    invalidScans: store.scanLogs.filter((scan) => scan.scanResult !== "VALID").length,
    duplicateScans: 0,
    gpsAlerts: store.gpsLocationLogs.filter((log) => log.status === "outside").length,
  };
}
