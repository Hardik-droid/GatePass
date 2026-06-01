import { getStore } from "../core/store";

export function getDashboard(eventId?: string) {
  const store = getStore();
  void eventId;
  return {
    totalEvents: store.events.length,
    activeEvents: store.events.filter((event) => event.status === "live").length,
    soldTickets: store.tickets.length,
    checkedInTickets: store.tickets.filter((ticket) => ticket.status === "checked_in").length,
    unusedTickets: store.tickets.filter((ticket) => ticket.status !== "checked_in").length,
    manualTickets: 0,
    revenuePaisa: store.tickets.length * 29900,
    invalidScans: store.scanLogs.filter((scan) => scan.scanResult !== "VALID").length,
    duplicateScans: 0,
    gpsAlerts: store.gpsLocationLogs.filter((log) => log.status === "outside").length,
  };
}
