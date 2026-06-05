import fs from "node:fs";
import path from "node:path";
import { createId, nowIso } from "./ids";

export type Store = ReturnType<typeof createStore>;
type NotificationRow = Record<string, unknown> & {
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
type AuditRow = Record<string, unknown> & {
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
type WalletPassRow = Record<string, unknown> & {
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

const STORE_FILE = path.join(process.cwd(), ".gatepass-store.json");

function createStore() {
  const organizationId = "org_demo";
  const eventId = "evt_demo_concert";
  const categories = [
    { id: "cat_general", eventId, name: "General", pricePaisa: 29900, capacity: 500 },
    { id: "cat_vip", eventId, name: "VIP", pricePaisa: 89900, capacity: 100 },
  ];
  const tickets = [
    {
      id: "TCK-8F42",
      organizationId,
      eventId,
      ticketCategoryId: "cat_vip",
      attendeeName: "Aarav Mehta",
      attendeeEmail: "dev@gatepass.local",
      attendeePhone: "+919000000000",
      status: "issued",
      checkedInAt: "",
      checkedInGateId: "",
      checkedInBy: "",
      qrToken: "demo-token-TCK-8F42",
      qrTokenHash: "legacy-demo-token-TCK-8F42",
      walletEnabled: true,
      appleWalletPassId: "",
      googleWalletPassId: "",
      walletLastUpdatedAt: "",
    },
  ];
  return {
    organizations: [{ id: organizationId, name: "GatePass Demo" }],
    organizationMembers: [] as Record<string, unknown>[],
    events: [{
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
    }],
    ticketCategories: categories,
    orders: [] as Record<string, unknown>[],
    payments: [] as Record<string, unknown>[],
    tickets,
    notifications: [] as NotificationRow[],
    auditEvents: [] as AuditRow[],
    scanLogs: [] as Record<string, unknown>[],
    gpsLocationLogs: [{ id: createId("gps"), status: "inside", createdAt: nowIso() }],
    eventGates: [{ id: "gate_main", eventId, name: "Main Gate", status: "online", scansPerMinute: 12 }],
    settlements: [] as Record<string, unknown>[],
    walletPasses: [] as WalletPassRow[],
    walletDevices: [] as Record<string, unknown>[],
    walletPassRegistrations: [] as Record<string, unknown>[],
    userWalletPreferences: [{ userId: "usr_demo", walletPreference: "ask", walletAutoPromptSeen: false }] as UserWalletPreferenceRow[],
    idempotency: new Map<string, unknown>(),
  };
}

function persistableStore(store: Store) {
  return {
    ...store,
    idempotency: undefined,
  };
}

function loadStoreFromDisk(): Store | null {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      return null;
    }

    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, "utf8")) as Partial<Store>;
    const fresh = createStore();

    return {
      ...fresh,
      ...parsed,
      idempotency: new Map<string, unknown>(),
    };
  } catch {
    return null;
  }
}

const globalStore = globalThis as typeof globalThis & { __gatepassStore?: Store };

export function getStore() {
  globalStore.__gatepassStore ??= loadStoreFromDisk() ?? createStore();
  return globalStore.__gatepassStore;
}

export function saveStore() {
  const store = getStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(persistableStore(store), null, 2));
}
