import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export type GatePassSession = {
  userId: string;
  email: string;
  name?: string;
  provider: "email" | "google" | "apple" | "dev";
  role: "attendee" | "owner" | "scanner";
};

const COOKIE_NAME = "gatepass_session";

function secret() {
  return process.env.SESSION_SIGNING_SECRET || process.env.WALLET_LINK_SIGNING_SECRET || "gatepass-dev-session-secret";
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
  return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
}

export function setSessionCookie(response: NextResponse, session: GatePassSession) {
  response.cookies.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function isSupabaseAuthConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

