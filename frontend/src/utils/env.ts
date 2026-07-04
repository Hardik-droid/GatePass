import type { NextRequest } from "next/server";

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
