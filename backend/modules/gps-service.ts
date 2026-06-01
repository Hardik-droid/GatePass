import { createId, nowIso } from "../core/ids";
import { getStore } from "../core/store";

export function createGatepassRequest(payload: Record<string, unknown>) {
  return { request: { id: createId("gpr"), status: "submitted", createdAt: nowIso(), ...payload } };
}

export function approveGatepassRequest(id: string, approved = true) {
  return { id, status: approved ? "approved" : "rejected", approvedAt: nowIso() };
}

export function logLocation(payload: Record<string, unknown>) {
  const log = { id: createId("gps"), status: "inside", createdAt: nowIso(), ...payload };
  getStore().gpsLocationLogs.unshift(log);
  return { log };
}

export function checkGeofence(payload: Record<string, unknown>) {
  return { status: "inside", inside: true, ...payload };
}

export function markOutsideGeofence(payload: Record<string, unknown>) {
  return logLocation({ ...payload, status: "outside" });
}
