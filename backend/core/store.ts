import { createId, nowIso } from "./ids";
import { deleteStateRow, getStateProvider, loadStateRows, upsertStateRows, upsertStateRow } from "../db/state";

type Row = Record<string, any>;

type NotificationRow = Row & {
  id: string;
  target: string;
  subject: string;
  status: string;
  provider: string;
  attempts: number;
  relatedTicketId?: string;
  sentAt?: string;
  recipientEmail?: string;
};

type AuditRow = Row & {
  id: string;
  actor?: string;
  actorRole: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

type WalletPassRow = Row & {
  id: string;
  ticketId: string;
  userId?: string;
  provider: "apple" | "google";
  status: string;
  saveUrl?: string;
  providerPassId?: string;
  providerClassId?: string;
  serialNumber?: string;
  authenticationTokenHash?: string;
  lastSyncedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

type UserWalletPreferenceRow = {
  userId: string;
  walletPreference: "apple" | "google" | "ask" | "none";
  preferredWalletProvider?: "apple" | "google";
  walletAutoPromptSeen: boolean;
  walletLastSelectedAt?: string;
};

type StoreKey =
  | "organizations"
  | "organizationMembers"
  | "events"
  | "ticketCategories"
  | "orders"
  | "payments"
  | "tickets"
  | "notifications"
  | "auditEvents"
  | "scanLogs"
  | "gpsLocationLogs"
  | "eventGates"
  | "settlements"
  | "users"
  | "walletPasses"
  | "walletDevices"
  | "walletPassRegistrations"
  | "userWalletPreferences"
  | "gatepassRequests";

function createBaseStore() {
  return {
    organizations: [] as Row[],
    organizationMembers: [] as Row[],
    events: [] as Row[],
    ticketCategories: [] as Row[],
    orders: [] as Row[],
    payments: [] as Row[],
    tickets: [] as Row[],
    notifications: [] as NotificationRow[],
    auditEvents: [] as AuditRow[],
    scanLogs: [] as Row[],
    gpsLocationLogs: [] as Row[],
    eventGates: [] as Row[],
    settlements: [] as Row[],
    users: [] as Row[],
    walletPasses: [] as WalletPassRow[],
    walletDevices: [] as Row[],
    walletPassRegistrations: [] as Row[],
    userWalletPreferences: [] as UserWalletPreferenceRow[],
    gatepassRequests: [] as Row[],
    idempotency: new Map<string, unknown>(),
  };
}

function createDemoStore() {
  const store = createBaseStore();
  const organizationId = "org_demo";
  const eventId = "evt_demo_concert";

  store.organizations.push({ id: organizationId, name: "GatePass Demo" });
  store.events.push({
    id: eventId,
    organizationId,
    slug: "demo-concert",
    title: "Demo Concert",
    description: "Server-backed demo event for GatePass booking and scanning.",
    eventType: "concert",
    status: "live",
    visibility: "public",
    venue: "Main Ground",
    city: "Mumbai",
    startTime: nowIso(),
    gpsRequired: false,
  });
  store.ticketCategories.push(
    { id: "cat_general", eventId, name: "General", pricePaisa: 29900, capacity: 500 },
    { id: "cat_vip", eventId, name: "VIP", pricePaisa: 89900, capacity: 100 },
  );
  store.tickets.push({
    id: "TCK-8F42",
    ticketId: "TCK-8F42",
    orderId: "",
    organizationId,
    eventId,
    ticketCategoryId: "cat_vip",
    attendeeName: "Aarav Mehta",
    attendeeEmail: "dev@gatepass.local",
    attendeePhone: "+919000000000",
    status: "active",
    checkedInAt: "",
    checkedInGateId: "",
    checkedInBy: "",
    scannedAt: "",
    scannedBy: "",
    qrToken: "demo-token-TCK-8F42",
    qrTokenHash: "legacy-demo-token-TCK-8F42",
    walletEnabled: true,
    appleWalletPassId: "",
    googleWalletPassId: "",
    walletLastUpdatedAt: "",
  });
  store.gpsLocationLogs.push({ id: createId("gps"), status: "inside", createdAt: nowIso() });
  store.eventGates.push({ id: "gate_main", eventId, name: "Main Gate", status: "online", scansPerMinute: 12 });
  store.userWalletPreferences.push({ userId: "usr_demo", walletPreference: "ask", walletAutoPromptSeen: false });
  return store;
}

export type Store = ReturnType<typeof createDemoStore>;

const collectionEntityTypes: Record<StoreKey, string> = {
  organizations: "organizations",
  organizationMembers: "organization_members",
  events: "events",
  ticketCategories: "ticket_categories",
  orders: "orders",
  payments: "payments",
  tickets: "tickets",
  notifications: "notification_outbox",
  auditEvents: "audit_events",
  scanLogs: "scan_logs",
  gpsLocationLogs: "gps_location_logs",
  eventGates: "event_gates",
  settlements: "settlements",
  users: "users",
  walletPasses: "wallet_passes",
  walletDevices: "wallet_devices",
  walletPassRegistrations: "wallet_pass_registrations",
  userWalletPreferences: "user_wallet_preferences",
  gatepassRequests: "gatepass_requests",
};

const entityTypeToCollection = Object.fromEntries(
  Object.entries(collectionEntityTypes).map(([collection, entityType]) => [entityType, collection]),
) as Record<string, StoreKey>;

const globalStore = globalThis as typeof globalThis & { __gatepassStore?: Store; __gatepassStoreBootstrap?: Promise<void> };

function createEmptyStore(): Store {
  return createBaseStore();
}

function getCollection(store: Store, key: StoreKey) {
  return store[key] as Row[];
}

function entityIdFor(key: StoreKey, value: Row) {
  if (typeof value.id === "string" && value.id) return value.id;
  if (key === "userWalletPreferences" && typeof value.userId === "string" && value.userId) return value.userId;
  return String(value.entityId ?? value.userId ?? value.ticketId ?? value.orderId ?? value.eventId ?? createId(key.slice(0, 3)));
}

function toStateRows(store: Store) {
  const rows: Array<{ entityType: string; entityId: string; payload: Record<string, unknown> }> = [];
  for (const key of Object.keys(collectionEntityTypes) as StoreKey[]) {
    for (const item of getCollection(store, key)) {
      rows.push({
        entityType: collectionEntityTypes[key],
        entityId: entityIdFor(key, item),
        payload: item,
      });
    }
  }
  return rows;
}

function loadStoreFromRows(rows: Array<{ entity_type: string; entity_id: string; payload: Record<string, any> }>) {
  const store = createEmptyStore();
  for (const row of rows) {
    const collection = entityTypeToCollection[row.entity_type];
    if (!collection) continue;
    getCollection(store, collection).push(row.payload);
  }
  return store;
}

async function bootstrapStore() {
  const current = globalStore.__gatepassStore ?? createDemoStore();
  const rows = await loadStateRows();
  if (!rows.length) {
    globalStore.__gatepassStore = current;
    await upsertStateRows(toStateRows(current));
    return;
  }

  globalStore.__gatepassStore = loadStoreFromRows(rows);
}

function ensureBootstrap() {
  globalStore.__gatepassStoreBootstrap ??= bootstrapStore().catch((error) => {
    console.error(`${getStateProvider()} store bootstrap failed`, error);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    globalStore.__gatepassStore = globalStore.__gatepassStore ?? createDemoStore();
  });
  return globalStore.__gatepassStoreBootstrap;
}

export async function ensureStoreReady() {
  await ensureBootstrap();
  return getStore();
}

export function getStore() {
  globalStore.__gatepassStore ??= createDemoStore();
  void ensureBootstrap();
  return globalStore.__gatepassStore;
}

export async function refreshStoreFromDatabase() {
  globalStore.__gatepassStoreBootstrap = undefined;
  await ensureBootstrap();
  return getStore();
}

export async function persistStoreRecord(key: StoreKey, payload: Row) {
  return persistStoreUpdate(key, payload);
}

export async function persistStoreRecords(key: StoreKey, payloads: Row[]) {
  if (!payloads.length) return payloads;
  const store = getStore();
  const entityType = collectionEntityTypes[key];
  const rows = payloads.map((payload) => {
    return {
      entityType,
      entityId: entityIdFor(key, payload),
      payload,
    };
  });
  for (const payload of payloads) {
    const entityId = entityIdFor(key, payload);
    const collection = getCollection(store, key);
    const index = collection.findIndex((item) => entityIdFor(key, item) === entityId);
    if (index >= 0) collection[index] = payload;
    else collection.push(payload);
  }
  await upsertStateRows(rows);
  return payloads;
}

export async function persistStoreUpdate(key: StoreKey, payload: Row) {
  const store = getStore();
  const entityType = collectionEntityTypes[key];
  const entityId = entityIdFor(key, payload);
  const collection = getCollection(store, key);
  const index = collection.findIndex((item) => entityIdFor(key, item) === entityId);
  if (index >= 0) {
    collection[index] = payload;
  } else {
    collection.push(payload);
  }
  await upsertStateRow(entityType, entityId, payload);
  return payload;
}

export async function deleteStoreRecord(key: StoreKey, payload: Row) {
  const store = getStore();
  const entityType = collectionEntityTypes[key];
  const entityId = entityIdFor(key, payload);
  const collection = getCollection(store, key);
  const index = collection.findIndex((item) => entityIdFor(key, item) === entityId);
  if (index >= 0) {
    collection.splice(index, 1);
  }
  await deleteStateRow(entityType, entityId);
}
