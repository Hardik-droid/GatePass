import crypto from "node:crypto";
import { cookies } from "next/headers";
import { isDevAuthEnabled } from "@/utils/env";
import { getNeonServerSession, isNeonAuthConfigured } from "./neon-auth";

export type GatePassSession = {
  userId: string;
  email: string;
  name?: string;
  provider: "email" | "google" | "apple" | "dev";
  role: "attendee" | "owner" | "scanner";
  phone?: string;
};

const COOKIE_NAME = "gatepass_session";

function secret() {
  const value = process.env.SESSION_SIGNING_SECRET || process.env.WALLET_LINK_SIGNING_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SIGNING_SECRET is required in production");
  }
  return value || "gatepass-dev-session-secret";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(session: GatePassSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value?: string) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || signature !== sign(payload)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GatePassSession;
  } catch {
    return null;
  }
}

export async function getServerSession() {
  const cookieStore = await cookies();

  if (isNeonAuthConfigured()) {
    try {
      const neonSession = await getNeonServerSession();
      if (neonSession) return neonSession;
    } catch {
      if (!isDevAuthEnabled()) return null;
    }

    if (!isDevAuthEnabled()) return null;
  }

  const legacySession = decodeSession(cookieStore.get(COOKIE_NAME)?.value);
  return legacySession;
}

type CookieWritableResponse = {
  cookies: {
    set(name: string, value: string, options: Record<string, unknown>): void;
  };
};

export function setSessionCookie(response: CookieWritableResponse, session: GatePassSession) {
  response.cookies.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: CookieWritableResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function roleFromMetadata(value: unknown): GatePassSession["role"] {
  return value === "owner" || value === "scanner" ? value : "attendee";
}
