import { createId, nowIso } from "../core/ids";
import { getStore, persistStoreRecord, persistStoreUpdate } from "../core/store";

export function createGatepassRequest(payload: Record<string, unknown>) {
  const request = { id: createId("gpr"), status: "submitted", createdAt: nowIso(), ...payload };
  void persistStoreRecord("gatepassRequests", request).catch((error) => console.error("Gatepass request persistence failed", error));
  return { request };
}

export function approveGatepassRequest(id: string, approved = true) {
  const request = { id, status: approved ? "approved" : "rejected", approvedAt: nowIso() };
  void persistStoreUpdate("gatepassRequests", request).catch((error) => console.error("Gatepass approval persistence failed", error));
  return request;
}

export function logLocation(payload: Record<string, unknown>) {
  const log = { id: createId("gps"), status: "inside", createdAt: nowIso(), ...payload };
  getStore().gpsLocationLogs.unshift(log);
  void persistStoreRecord("gpsLocationLogs", log).catch((error) => console.error("GPS persistence failed", error));
  return { log };
}

export function checkGeofence(payload: Record<string, unknown>) {
  return { status: "inside", inside: true, ...payload };
}

export function markOutsideGeofence(payload: Record<string, unknown>) {
  return logLocation({ ...payload, status: "outside" });
}
