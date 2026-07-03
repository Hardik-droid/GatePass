import crypto from "node:crypto";
import { getStore } from "../core/store";
import { recordAudit } from "./audit";
import { getTicket } from "./tickets";
import { getOrCreateGoogleWalletObject, syncWalletPassStatus } from "./wallet-service";

export function isGoogleWalletConfigured() {
  const missing = [
    "GOOGLE_WALLET_ISSUER_ID",
    "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_WALLET_PRIVATE_KEY",
    "GOOGLE_WALLET_ORIGIN",
  ].filter((key) => !process.env[key]);
  return { configured: missing.length === 0, missing };
}

export function getOrCreateEventTicketClass(event: Record<string, unknown>) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || "dev";
  const suffix = process.env.GOOGLE_WALLET_EVENT_TICKET_CLASS_SUFFIX || "gatepass_event";
  const classId = `${issuerId}.${suffix}`;
  recordAudit({ action: "wallet.google.class.created", entityType: "events", entityId: String(event.id ?? "unknown") });
  return {
    id: classId,
    issuerName: "GatePass",
    eventName: { defaultValue: { language: "en-US", value: String(event.title ?? "GatePass event") } },
    venue: { name: { defaultValue: { language: "en-US", value: String(event.venue ?? "") } } },
  };
}

export function createOrUpdateEventTicketObject(ticketId: string, token: string) {
  const ticket = getTicket(ticketId);
  if (!ticket) throw new Error("Ticket not found");
  const event = getStore().events.find((entry) => entry.id === ticket.eventId);
  const pass = getOrCreateGoogleWalletObject(ticketId);
  const classObject = getOrCreateEventTicketClass(event ?? {});
  const objectId = `${process.env.GOOGLE_WALLET_ISSUER_ID || "dev"}.${ticket.id}`;
  const object = {
    id: objectId,
    classId: classObject.id,
    state: ["active", "issued"].includes(String(ticket.status)) ? "ACTIVE" : "INACTIVE",
    ticketHolderName: ticket.attendeeName,
    ticketNumber: ticket.id,
    barcode: {
      type: "QR_CODE",
      value: token,
      alternateText: ticket.id,
    },
    eventName: { defaultValue: { language: "en-US", value: event?.title || "GatePass event" } },
    venue: { name: { defaultValue: { language: "en-US", value: event?.venue || "" } } },
    ticketType: { defaultValue: { language: "en-US", value: ticket.ticketCategoryId } },
  };
  pass.providerPassId = objectId;
  pass.providerClassId = classObject.id;
  pass.updatedAt = new Date().toISOString();
  recordAudit({ action: "wallet.google.object.created", entityType: "wallet_passes", entityId: pass.id });
  return object;
}

export function generateGoogleWalletSaveJwt(ticketId: string, token: string) {
  const configured = isGoogleWalletConfigured();
  if (!configured.configured) {
    return { configured: false, missing: configured.missing, message: "Google Wallet temporarily unavailable" };
  }
  const object = createOrUpdateEventTicketObject(ticketId, token);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const privateKey = String(process.env.GOOGLE_WALLET_PRIVATE_KEY).replace(/\\n/g, "\n");
  const claims = {
    iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [process.env.GOOGLE_WALLET_ORIGIN],
    payload: { eventTicketObjects: [object] },
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = crypto.createSign("RSA-SHA256").update(`${header}.${payload}`).end().sign(privateKey).toString("base64url");
  recordAudit({ action: "wallet.google.save.jwt.generated", entityType: "tickets", entityId: ticketId });
  return { configured: true, jwt: `${header}.${payload}.${signature}`, object };
}

export function generateGoogleWalletSaveUrl(ticketId: string, token: string) {
  const jwt = generateGoogleWalletSaveJwt(ticketId, token);
  if (!jwt.configured || !("jwt" in jwt)) return jwt;
  syncWalletPassStatus(ticketId, "save_started");
  return { configured: true, url: `https://pay.google.com/gp/v/save/${jwt.jwt}`, jwt: jwt.jwt };
}

export function patchGoogleWalletObjectStatus(ticketId: string, status: string) {
  syncWalletPassStatus(ticketId, status === "ACTIVE" ? "active" : "voided");
  recordAudit({ action: "wallet.google.object.updated", entityType: "tickets", entityId: ticketId, newValue: { status } });
  return { updated: true };
}
