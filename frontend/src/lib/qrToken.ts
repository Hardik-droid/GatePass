import crypto from "node:crypto";

function getQrSecret(): string {
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error("QR_SECRET missing in .env.local");
  }
  return secret;
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function signPayload(ticketId: string, rawToken: string): string {
  return crypto
    .createHmac("sha256", getQrSecret())
    .update(`${ticketId}.${rawToken}`)
    .digest("hex");
}

export function createQrPayload(ticketId: string, rawToken: string): string {
  const signature = signPayload(ticketId, rawToken);
  return `GP1.${ticketId}.${rawToken}.${signature}`;
}

export function parseQrPayload(qrPayload: string) {
  if (!qrPayload || typeof qrPayload !== "string") {
    throw new Error("Invalid QR payload");
  }

  const parts = qrPayload.split(".");

  if (parts.length !== 4 || parts[0] !== "GP1") {
    throw new Error("Unsupported QR format");
  }

  const [, ticketId, rawToken, signature] = parts;

  if (!ticketId || !rawToken || !signature) {
    throw new Error("Malformed QR payload");
  }

  return { ticketId, rawToken, signature };
}

export function verifyQrPayload(qrPayload: string) {
  const parsed = parseQrPayload(qrPayload);
  const expectedSignature = signPayload(parsed.ticketId, parsed.rawToken);

  const valid = crypto.timingSafeEqual(
    Buffer.from(parsed.signature, "hex"),
    Buffer.from(expectedSignature, "hex"),
  );

  if (!valid) {
    throw new Error("Invalid QR signature");
  }

  return parsed;
}
