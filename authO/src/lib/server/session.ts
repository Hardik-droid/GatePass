import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server";
import { isDevAuthEnabled } from "@/utils/supabase/env";

export type GatePassSession = {
  userId: string;
  email: string;
  name?: string;
  provider: "email" | "google" | "apple" | "dev";
  role: "attendee" | "owner" | "scanner";
  phone?: string;
};

const COOKIE_NAME = "gatepass_session";
let neonAuth: NeonAuth | null = null;

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

export function isNeonAuthConfigured() {
  return Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);
}

export function getNeonAuthConfigStatus() {
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET ?? "";
  return {
    configured: isNeonAuthConfigured(),
    hasBaseUrl: Boolean(process.env.NEON_AUTH_BASE_URL),
    hasCookieSecret: Boolean(process.env.NEON_AUTH_COOKIE_SECRET),
    cookieSecretLengthOk: cookieSecret.length >= 32,
  };
}

export function getNeonAuth() {
  if (!isNeonAuthConfigured()) return null;

  neonAuth ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
      secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      sameSite: "lax",
    },
    logLevel: process.env.NODE_ENV === "production" ? "warn" : "error",
  });

  return neonAuth;
}

type NeonSessionUser = {
  id?: string;
  email?: string;
  name?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
};

type NeonSessionData = {
  user?: NeonSessionUser | null;
};

type GatePassRole = "attendee" | "owner" | "scanner";

function isSessionResponse(value: unknown): value is { data?: NeonSessionData | null; error?: unknown } {
  return Boolean(value && typeof value === "object" && "data" in value);
}

export async function getNeonServerSession() {
  const auth = getNeonAuth();
  if (!auth) return null;

  const result = (await auth.getSession()) as unknown;
  const data = isSessionResponse(result) ? result.data : (result as NeonSessionData | null);
  const user = data?.user;
  if (!user?.id || !user.email) return null;

  const role: GatePassRole = user.role === "owner" || user.role === "scanner" ? user.role : "attendee";

  return {
    userId: user.id,
    email: user.email,
    name: user.name ?? undefined,
    provider: "email" as const,
    role,
    phone: user.phoneNumber ?? user.phone ?? undefined,
  };
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
