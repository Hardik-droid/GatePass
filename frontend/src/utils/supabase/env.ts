import type { NextRequest } from "next/server";

export function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function getSupabasePublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function getSupabaseSecretKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function getSupabaseJwksUrl() {
  if (process.env.SUPABASE_JWKS_URL) return process.env.SUPABASE_JWKS_URL;
  const url = getSupabaseUrl();
  return url ? `${url.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json` : "";
}

export function hasSupabaseAuthConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function isDevAuthEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true";
}

export function getAppUrl(request?: Pick<NextRequest, "headers" | "nextUrl" | "url">) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const forwardedHost = request?.headers.get("x-forwarded-host")?.trim();
  const forwardedProto = request?.headers.get("x-forwarded-proto")?.trim();
  if (forwardedHost) {
    const protocol = forwardedProto || request?.nextUrl.protocol.replace(":", "") || "http";
    return `${protocol}://${forwardedHost}`;
  }

  if (request?.nextUrl?.origin) return request.nextUrl.origin;

  return "http://localhost:3000";
}
