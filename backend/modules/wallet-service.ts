import crypto from "node:crypto";
import { createId, nowIso } from "../core/ids";
import { getStore, persistStoreRecord, persistStoreUpdate } from "../core/store";
import { recordAudit } from "./audit";
import { getTicket } from "./tickets";

export type WalletPreference = "apple" | "google" | "ask" | "none";
type WalletProvider = "apple" | "google";
type WalletStatus =
  | "created"
  | "link_generated"
  | "downloaded"
  | "save_started"
  | "saved_unconfirmed"
  | "active"
  | "updated"
  | "voided"
  | "expired"
  | "revoked"
  | "failed";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function linkSecret() {
  const secret = process.env.WALLET_LINK_SIGNING_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("WALLET_LINK_SIGNING_SECRET is required in production");
  }
  return secret || "gatepass-dev-wallet-link-secret";
}

export function createApplePassAuthenticationToken(ticketId: string) {
  return crypto.createHmac("sha256", linkSecret()).update(`apple-pass-auth.${ticketId}`).digest("base64url");
}

export function hashWalletAuthenticationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signWalletLink(ticketId: string, provider: WalletProvider, expiresAt: number) {
  return crypto
    .createHmac("sha256", linkSecret())
    .update(`${ticketId}.${provider}.${expiresAt}`)
    .digest("base64url");
}

export function createSignedWalletLinkToken(ticketId: string, provider: WalletProvider, ttlSeconds = 60 * 30) {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${expiresAt}.${signWalletLink(ticketId, provider, expiresAt)}`;
}

export function verifySignedWalletLinkToken(ticketId: string, provider: WalletProvider, token: string) {
  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAt || !signature || expiresAt < Math.floor(Date.now() / 1000)) return false;
  return signature === signWalletLink(ticketId, provider, expiresAt);
}

export function getWalletPreference(userId = "usr_demo") {
  const store = getStore();
  let row = store.userWalletPreferences.find((preference) => preference.userId === userId);
  if (!row) {
    row = { userId, walletPreference: "ask", walletAutoPromptSeen: false };
    store.userWalletPreferences.push(row);
  }
  return row;
}

export function saveWalletPreference(userId: string, preference: WalletPreference) {
  const row = getWalletPreference(userId);
  const oldValue = { ...row };
  row.walletPreference = preference;
  row.preferredWalletProvider = preference === "apple" || preference === "google" ? preference : undefined;
  row.walletAutoPromptSeen = true;
  row.walletLastSelectedAt = nowIso();
  recordAudit({
    action: "wallet.preference.saved",
    entityType: "users_profile",
    entityId: userId,
    oldValue,
    newValue: row,
  });
  void persistStoreUpdate("userWalletPreferences", row).catch((error) => console.error("Wallet preference persistence failed", error));
  return row;
}

function providerConfigured(provider: WalletProvider) {
  if (provider === "apple") {
    const missing = [
      "APPLE_PASS_TYPE_IDENTIFIER",
      "APPLE_TEAM_IDENTIFIER",
      "APPLE_PASS_CERT_PATH",
      "APPLE_PASS_CERT_PASSWORD",
      "APPLE_WWDR_CERT_PATH",
      "APPLE_WALLET_WEB_SERVICE_URL",
    ].filter((key) => !process.env[key]);
    return { configured: missing.length === 0, missing };
  }
  const missing = [
    "GOOGLE_WALLET_ISSUER_ID",
    "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_WALLET_PRIVATE_KEY",
    "GOOGLE_WALLET_ORIGIN",
  ].filter((key) => !process.env[key]);
  return { configured: missing.length === 0, missing };
}

function getOrCreateWalletPass(ticketId: string, provider: WalletProvider) {
  const store = getStore();
  const ticket = getTicket(ticketId);
  if (!ticket) throw new Error("Ticket not found");
  let pass = store.walletPasses.find((row) => row.ticketId === ticketId && row.provider === provider);
  if (!pass) {
    const timestamp = nowIso();
    pass = {
      id: createId("wpass"),
      ticketId,
      userId: "usr_demo",
      provider,
      providerPassId: `${provider}.${ticketId}`,
      providerClassId: provider === "google" ? `${process.env.GOOGLE_WALLET_ISSUER_ID || "dev"}.${process.env.GOOGLE_WALLET_EVENT_TICKET_CLASS_SUFFIX || "gatepass_event"}` : undefined,
      serialNumber: provider === "apple" ? ticketId : undefined,
      authenticationTokenHash: provider === "apple" ? hashWalletAuthenticationToken(createApplePassAuthenticationToken(ticketId)) : undefined,
      status: "created",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    store.walletPasses.push(pass);
    const createdPass = pass;
    if (provider === "apple") ticket.appleWalletPassId = pass.id;
    if (provider === "google") ticket.googleWalletPassId = pass.id;
    ticket.walletLastUpdatedAt = timestamp;
    void Promise.all([
      persistStoreRecord("walletPasses", createdPass),
      persistStoreUpdate("tickets", ticket),
    ]).catch((error) => console.error("Wallet pass persistence failed", error));
    recordAudit({
      action: "wallet.pass.created",
      entityType: "wallet_passes",
      entityId: pass.id,
      newValue: { ticketId, provider },
    });
  }
  return pass;
}

export function getOrCreateAppleWalletPass(ticketId: string) {
  return getOrCreateWalletPass(ticketId, "apple");
}

export function getOrCreateGoogleWalletObject(ticketId: string) {
  return getOrCreateWalletPass(ticketId, "google");
}

export function generateApplePassDownloadUrl(ticketId: string) {
  const token = createSignedWalletLinkToken(ticketId, "apple");
  return `${APP_URL}/api/wallet/apple/pass/${encodeURIComponent(ticketId)}?token=${encodeURIComponent(token)}`;
}

export function generateGoogleSaveLink(ticketId: string) {
  const token = createSignedWalletLinkToken(ticketId, "google");
  return `${APP_URL}/api/wallet/google/save-link/${encodeURIComponent(ticketId)}?token=${encodeURIComponent(token)}`;
}

export function prepareWalletPasses(ticketId: string, context: Record<string, unknown> = {}) {
  const applePass = getOrCreateAppleWalletPass(ticketId);
  const googlePass = getOrCreateGoogleWalletObject(ticketId);
  const apple = providerConfigured("apple");
  const google = providerConfigured("google");
  applePass.status = "link_generated";
  googlePass.status = "link_generated";
  applePass.saveUrl = generateApplePassDownloadUrl(ticketId);
  googlePass.saveUrl = generateGoogleSaveLink(ticketId);
  applePass.updatedAt = nowIso();
  googlePass.updatedAt = applePass.updatedAt;
  void Promise.all([
    persistStoreUpdate("walletPasses", applePass),
    persistStoreUpdate("walletPasses", googlePass),
  ]).catch((error) => console.error("Wallet preparation persistence failed", error));
  recordAudit({
    action: "wallet.pass.prepared",
    entityType: "tickets",
    entityId: ticketId,
    newValue: { appleAvailable: apple.configured, googleAvailable: google.configured },
  });
  return {
    ticketId,
    apple: {
      available: apple.configured,
      configured: apple.configured,
      missing: apple.missing,
      url: applePass.saveUrl,
      status: applePass.status,
      walletPassId: applePass.id,
    },
    google: {
      available: google.configured,
      configured: google.configured,
      missing: google.missing,
      url: googlePass.saveUrl,
      status: googlePass.status,
      walletPassId: googlePass.id,
    },
  };
}

export function syncWalletPassStatus(ticketId: string, status: WalletStatus) {
  const timestamp = nowIso();
  const passes = getStore().walletPasses.filter((pass) => pass.ticketId === ticketId);
  passes.forEach((pass) => {
    pass.status = status;
    pass.lastSyncedAt = timestamp;
    pass.updatedAt = timestamp;
  });
  void Promise.all(passes.map((pass) => persistStoreUpdate("walletPasses", pass))).catch((error) =>
    console.error("Wallet status persistence failed", error),
  );
  recordAudit({
    action: "wallet.pass.status.synced",
    entityType: "tickets",
    entityId: ticketId,
    newValue: { status },
  });
  return passes;
}

export function voidWalletPass(ticketId: string, reason = "ticket_status_changed") {
  const passes = syncWalletPassStatus(ticketId, "voided");
  recordAudit({
    action: "wallet.pass.voided",
    entityType: "tickets",
    entityId: ticketId,
    newValue: { reason },
  });
  return passes;
}

export function getWalletStatusForTicket(ticketId: string) {
  return getStore().walletPasses.filter((pass) => pass.ticketId === ticketId);
}

export function getWalletPass(walletPassId: string) {
  return getStore().walletPasses.find((pass) => pass.id === walletPassId);
}
