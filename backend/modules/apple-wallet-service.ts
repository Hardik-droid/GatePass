import fs from "node:fs";
import { PKPass } from "passkit-generator";
import { generateQrSvgOrDataUrl } from "./qr-service";
import { getTicket } from "./tickets";
import { getStore } from "../core/store";
import { recordAudit } from "./audit";
import {
  createApplePassAuthenticationToken,
  getOrCreateAppleWalletPass,
  hashWalletAuthenticationToken,
  syncWalletPassStatus,
} from "./wallet-service";

const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

function readCertificate(path: string) {
  return fs.readFileSync(path);
}

export function isAppleWalletConfigured() {
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

export function buildApplePassPayload(ticketId: string, token: string) {
  const ticket = getTicket(ticketId);
  if (!ticket) throw new Error("Ticket not found");
  const ticketDetails = ticket as Record<string, unknown>;
  const event = getStore().events.find((entry) => entry.id === ticket.eventId);
  const eventDetails = (event ?? {}) as Record<string, unknown>;
  const authToken = createApplePassAuthenticationToken(ticket.id);
  return {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER,
    teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER,
    organizationName: process.env.APPLE_WALLET_ORGANIZATION_NAME || "GatePass",
    description: process.env.APPLE_WALLET_DESCRIPTION || "GatePass Event Ticket",
    serialNumber: ticket.id,
    authenticationToken: authToken,
    webServiceURL: process.env.APPLE_WALLET_WEB_SERVICE_URL,
    logoText: process.env.APPLE_WALLET_LOGO_TEXT || "GatePass",
    backgroundColor: "rgb(250,250,250)",
    foregroundColor: "rgb(26,26,26)",
    labelColor: "rgb(10,127,143)",
    barcode: {
      message: token,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
    },
    eventTicket: {
      primaryFields: [{ key: "event", label: "Event", value: event?.title || "GatePass event" }],
      secondaryFields: [
        { key: "date", label: "Date", value: event?.startTime || "" },
        { key: "venue", label: "Venue", value: event?.venue || "" },
      ],
      auxiliaryFields: [
        { key: "type", label: "Ticket Type", value: ticket.ticketCategoryId },
        { key: "gate", label: "Gate", value: "Main Gate" },
        { key: "status", label: "Status", value: ticket.status },
      ],
      backFields: [
        { key: "attendee", label: "Attendee Name", value: ticket.attendeeName },
        { key: "ticket", label: "Ticket ID", value: ticket.id },
        { key: "order", label: "Order ID", value: String(ticketDetails.orderId ?? "Manual booking") },
        { key: "instructions", label: "Entry Instructions", value: "Keep this pass ready at the gate. The QR is validated by GatePass scanners only." },
        { key: "refund", label: "Refund Policy", value: String(eventDetails.refundPolicy ?? "Organizer policy applies.") },
        { key: "support", label: "Support Contact", value: String(eventDetails.supportContact ?? "support@gatepass.local") },
        { key: "security", label: "Security Note", value: "This QR contains a secure GatePass token. Personal data is not encoded." },
      ],
    },
  };
}

function buildPassBuffers(payload: ReturnType<typeof buildApplePassPayload>) {
  return {
    "icon.png": TRANSPARENT_PNG,
    "icon@2x.png": TRANSPARENT_PNG,
    "logo.png": TRANSPARENT_PNG,
    "logo@2x.png": TRANSPARENT_PNG,
    "pass.json": Buffer.from(JSON.stringify(payload)),
  };
}

export async function signApplePkpass(ticketId: string, token: string) {
  const configured = isAppleWalletConfigured();
  if (!configured.configured) {
    return { configured: false, missing: configured.missing, message: "Apple Wallet temporarily unavailable" };
  }
  const walletPass = getOrCreateAppleWalletPass(ticketId);
  const payload = buildApplePassPayload(ticketId, token);
  walletPass.authenticationTokenHash = hashWalletAuthenticationToken(String(payload.authenticationToken));
  walletPass.updatedAt = new Date().toISOString();
  const pass = new PKPass(
    buildPassBuffers(payload),
    {
      wwdr: readCertificate(String(process.env.APPLE_WWDR_CERT_PATH)),
      signerCert: readCertificate(String(process.env.APPLE_PASS_CERT_PATH)),
      signerKey: readCertificate(String(process.env.APPLE_PASS_KEY_PATH || process.env.APPLE_PASS_CERT_PATH)),
      signerKeyPassphrase: process.env.APPLE_PASS_CERT_PASSWORD,
    },
    {
      serialNumber: ticketId,
    },
  );
  pass.setBarcodes({
    message: token,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
  });
  recordAudit({ action: "wallet.apple.pass.generated", entityType: "tickets", entityId: ticketId });
  return {
    configured: true,
    payload,
    qrDataUrl: await generateQrSvgOrDataUrl(token),
    pkpassBuffer: pass.getAsBuffer(),
  };
}

export function validateApplePassAuth(serialNumber: string, authToken: string) {
  const pass = getOrCreateAppleWalletPass(serialNumber);
  return pass.authenticationTokenHash === hashWalletAuthenticationToken(authToken);
}

export function registerAppleDevice(deviceLibraryIdentifier: string, serialNumber: string, pushToken = "") {
  const store = getStore();
  const pass = getOrCreateAppleWalletPass(serialNumber);
  let device = store.walletDevices.find((entry) => entry.deviceLibraryIdentifier === deviceLibraryIdentifier);
  if (!device) {
    device = { id: `wdev_${deviceLibraryIdentifier}`, provider: "apple", deviceLibraryIdentifier, pushToken, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.walletDevices.push(device);
  }
  if (!store.walletPassRegistrations.some((entry) => entry.walletPassId === pass.id && entry.walletDeviceId === device.id)) {
    store.walletPassRegistrations.push({ id: `wreg_${pass.id}_${device.id}`, walletPassId: pass.id, walletDeviceId: device.id, createdAt: new Date().toISOString() });
  }
  syncWalletPassStatus(serialNumber, "active");
  recordAudit({ action: "wallet.apple.device.registered", entityType: "wallet_passes", entityId: pass.id });
  return { registered: true };
}

export function unregisterAppleDevice(deviceLibraryIdentifier: string, serialNumber: string) {
  const store = getStore();
  const pass = getOrCreateAppleWalletPass(serialNumber);
  store.walletPassRegistrations = store.walletPassRegistrations.filter((entry) => {
    const device = store.walletDevices.find((item) => item.id === entry.walletDeviceId);
    return !(entry.walletPassId === pass.id && device?.deviceLibraryIdentifier === deviceLibraryIdentifier);
  });
  recordAudit({ action: "wallet.apple.device.unregistered", entityType: "wallet_passes", entityId: pass.id });
  return { unregistered: true };
}

export function getChangedApplePassSerials(deviceLibraryIdentifier: string) {
  void deviceLibraryIdentifier;
  return { serialNumbers: getStore().walletPasses.filter((pass) => pass.provider === "apple").map((pass) => pass.serialNumber).filter(Boolean) };
}

export function pushApplePassUpdate(serialNumber: string) {
  recordAudit({ action: "wallet.apple.pass.update.requested", entityType: "tickets", entityId: serialNumber });
  return { queued: false, message: "Apple push credentials not configured in dev mode" };
}
