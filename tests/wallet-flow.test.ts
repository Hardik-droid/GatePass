import { describe, expect, it } from "vitest";
import { createSecureQrToken, hashQrToken, verifyQrToken } from "@/backend/modules/qr-service";
import { validateScan } from "@/backend/modules/scanner";
import { getStore } from "@/backend/core/store";
import { saveWalletPreference, prepareWalletPasses, createSignedWalletLinkToken, verifySignedWalletLinkToken } from "@/backend/modules/wallet-service";
import { buildApplePassPayload } from "@/backend/modules/apple-wallet-service";
import { createOrUpdateEventTicketObject } from "@/backend/modules/google-wallet-service";

describe("wallet QR flow", () => {
  it("generates signed QR tokens without personal data", () => {
    const token = createSecureQrToken("TCK-WALLET-1", "EVT-WALLET");
    const verified = verifyQrToken(token);
    expect(verified.valid).toBe(true);
    expect(verified.ticketId).toBe("TCK-WALLET-1");
    expect(token).not.toContain("dev@gatepass.local");
    expect(token).not.toContain("+919");
    expect(token).not.toContain("PAY-");
  });

  it("rejects tampered QR tokens", () => {
    const token = createSecureQrToken("TCK-WALLET-2", "EVT-WALLET");
    expect(verifyQrToken(`${token}tampered`).valid).toBe(false);
  });

  it("prepares idempotent wallet links and signed short-lived links", () => {
    const store = getStore();
    const token = createSecureQrToken("TCK-WALLET-3", "EVT-WALLET");
    store.tickets.push({
      id: "TCK-WALLET-3",
      organizationId: "org_demo",
      eventId: "EVT-WALLET",
      ticketCategoryId: "cat_general",
      attendeeName: "Wallet Tester",
      attendeeEmail: "wallet@gatepass.test",
      attendeePhone: "+919111111111",
      status: "issued",
      checkedInAt: "",
      checkedInGateId: "",
      checkedInBy: "",
      qrToken: "",
      qrTokenHash: hashQrToken(token),
      walletEnabled: true,
      appleWalletPassId: "",
      googleWalletPassId: "",
      walletLastUpdatedAt: "",
    });
    const first = prepareWalletPasses("TCK-WALLET-3");
    const second = prepareWalletPasses("TCK-WALLET-3");
    expect(first.apple.walletPassId).toBe(second.apple.walletPassId);
    const linkToken = createSignedWalletLinkToken("TCK-WALLET-3", "apple", 60);
    expect(verifySignedWalletLinkToken("TCK-WALLET-3", "apple", linkToken)).toBe(true);
    expect(verifySignedWalletLinkToken("TCK-WALLET-3", "google", linkToken)).toBe(false);
    const expiredToken = createSignedWalletLinkToken("TCK-WALLET-3", "apple", -1);
    expect(verifySignedWalletLinkToken("TCK-WALLET-3", "apple", expiredToken)).toBe(false);
  });

  it("puts the same secure QR token into Apple and Google wallet payloads", () => {
    const store = getStore();
    const token = createSecureQrToken("TCK-WALLET-PAYLOAD", "EVT-WALLET");
    store.tickets.push({
      id: "TCK-WALLET-PAYLOAD",
      organizationId: "org_demo",
      eventId: "EVT-WALLET",
      ticketCategoryId: "cat_general",
      attendeeName: "Payload Tester",
      attendeeEmail: "payload@gatepass.test",
      attendeePhone: "+919555555555",
      status: "issued",
      checkedInAt: "",
      checkedInGateId: "",
      checkedInBy: "",
      qrToken: "",
      qrTokenHash: hashQrToken(token),
      walletEnabled: true,
      appleWalletPassId: "",
      googleWalletPassId: "",
      walletLastUpdatedAt: "",
    });
    const applePayload = buildApplePassPayload("TCK-WALLET-PAYLOAD", token);
    const googleObject = createOrUpdateEventTicketObject("TCK-WALLET-PAYLOAD", token);
    expect(applePayload.barcode.message).toBe(token);
    expect(googleObject.barcode.value).toBe(token);
    expect(JSON.stringify(applePayload.barcode)).not.toContain("payload@gatepass.test");
    expect(JSON.stringify(googleObject.barcode)).not.toContain("+919555555555");
  });

  it("saves wallet preference", () => {
    const preference = saveWalletPreference("usr_wallet_test", "google");
    expect(preference.walletPreference).toBe("google");
    expect(preference.walletAutoPromptSeen).toBe(true);
  });

  it("validates first scan and blocks duplicate wallet QR scan", () => {
    const store = getStore();
    const token = createSecureQrToken("TCK-WALLET-4", "EVT-WALLET");
    store.tickets.push({
      id: "TCK-WALLET-4",
      organizationId: "org_demo",
      eventId: "EVT-WALLET",
      ticketCategoryId: "cat_general",
      attendeeName: "Wallet Scan",
      attendeeEmail: "scan@gatepass.test",
      attendeePhone: "+919222222222",
      status: "issued",
      checkedInAt: "",
      checkedInGateId: "",
      checkedInBy: "",
      qrToken: "",
      qrTokenHash: hashQrToken(token),
      walletEnabled: true,
      appleWalletPassId: "",
      googleWalletPassId: "",
      walletLastUpdatedAt: "",
    });
    expect(validateScan({ qrToken: token }).status).toBe("VALID");
    expect(validateScan({ qrToken: token }).status).toBe("ALREADY USED");
  });

  it("rejects cancelled and refunded tickets", () => {
    const store = getStore();
    const cancelledToken = createSecureQrToken("TCK-WALLET-CANCELLED", "EVT-WALLET");
    const refundedToken = createSecureQrToken("TCK-WALLET-REFUNDED", "EVT-WALLET");
    store.tickets.push(
      {
        id: "TCK-WALLET-CANCELLED",
        organizationId: "org_demo",
        eventId: "EVT-WALLET",
        ticketCategoryId: "cat_general",
        attendeeName: "Cancelled",
        attendeeEmail: "cancelled@gatepass.test",
        attendeePhone: "+919333333333",
        status: "cancelled",
        checkedInAt: "",
        checkedInGateId: "",
        checkedInBy: "",
        qrToken: "",
        qrTokenHash: hashQrToken(cancelledToken),
        walletEnabled: true,
        appleWalletPassId: "",
        googleWalletPassId: "",
        walletLastUpdatedAt: "",
      },
      {
        id: "TCK-WALLET-REFUNDED",
        organizationId: "org_demo",
        eventId: "EVT-WALLET",
        ticketCategoryId: "cat_general",
        attendeeName: "Refunded",
        attendeeEmail: "refunded@gatepass.test",
        attendeePhone: "+919444444444",
        status: "refunded",
        checkedInAt: "",
        checkedInGateId: "",
        checkedInBy: "",
        qrToken: "",
        qrTokenHash: hashQrToken(refundedToken),
        walletEnabled: true,
        appleWalletPassId: "",
        googleWalletPassId: "",
        walletLastUpdatedAt: "",
      },
    );
    expect(validateScan({ qrToken: cancelledToken }).status).toBe("CANCELLED");
    expect(validateScan({ qrToken: refundedToken }).status).toBe("REFUNDED");
  });
});
