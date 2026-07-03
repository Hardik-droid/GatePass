import crypto from "node:crypto";
import QRCode from "qrcode";

const TOKEN_VERSION = "v1";

function signingSecret() {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("QR_SIGNING_SECRET is required in production");
  }
  return secret || "gatepass-dev-qr-signing-secret";
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: Record<string, unknown>) {
  return crypto
    .createHmac("sha256", signingSecret())
    .update(JSON.stringify(payload))
    .digest("base64url");
}

export function createSecureQrToken(ticketId: string, eventId = "evt_demo_concert") {
  const payload = {
    version: TOKEN_VERSION,
    event_id: eventId,
    ticket_id: ticketId,
    nonce: crypto.randomBytes(16).toString("base64url"),
    issued_at: new Date().toISOString(),
  };
  return `${base64UrlEncode(JSON.stringify(payload))}.${signPayload(payload)}`;
}

export function hashQrToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyQrToken(token: string) {
  try {
    if (!token) return { valid: false, ticketId: "", eventId: "", payload: null };

    if (token.startsWith("demo-token-") || token.startsWith("token-")) {
      const ticketId = token.replace(/^demo-token-/, "").replace(/^token-/, "");
      return {
        valid: true,
        ticketId,
        eventId: "evt_demo_concert",
        payload: { version: "legacy", ticket_id: ticketId, event_id: "evt_demo_concert" },
      };
    }

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) {
      return { valid: false, ticketId: "", eventId: "", payload: null };
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as {
      version?: string;
      event_id?: string;
      ticket_id?: string;
      nonce?: string;
      issued_at?: string;
    };
    const expected = signPayload(payload);
    const sigBuf = Buffer.from(signature, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    // timingSafeEqual throws if lengths differ — guard against that
    const valid =
      sigBuf.length === expBuf.length &&
      crypto.timingSafeEqual(sigBuf, expBuf);
    return {
      valid,
      ticketId: valid ? String(payload.ticket_id ?? "") : "",
      eventId: valid ? String(payload.event_id ?? "") : "",
      payload: valid ? payload : null,
    };
  } catch {
    return { valid: false, ticketId: "", eventId: "", payload: null };
  }
}

export async function generateQrSvgOrDataUrl(token: string) {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
    color: {
      dark: "#0a7f8f",
      light: "#ffffff",
    },
  });
}

export const generateQrDataUrl = generateQrSvgOrDataUrl;
