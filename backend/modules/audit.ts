import { createId, nowIso } from "../core/ids";
import { getStore, persistStoreRecord } from "../core/store";

export function listAuditEvents() {
  return getStore().auditEvents;
}

export function recordAudit(payload: Record<string, unknown>) {
  const timestamp = nowIso();
  const event = {
    id: createId("audit"),
    timestamp,
    createdAt: timestamp,
    ...payload,
    actorRole: String(payload.actorRole ?? "SYSTEM"),
    actorUserId: String(payload.actorUserId ?? "system"),
    action: String(payload.action ?? "audit.event"),
    entityType: String(payload.entityType ?? "system"),
    entityId: String(payload.entityId ?? "unknown"),
  };
  getStore().auditEvents.unshift(event);
  void persistStoreRecord("auditEvents", event).catch((error) => console.error("Audit persistence failed", error));
  return event;
}
