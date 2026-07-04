import { NextRequest, NextResponse } from "next/server";

function safeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

export async function GET(request: NextRequest) {
  const redirect = safeRedirect(request.nextUrl.searchParams.get("redirect") || "/app");
  return NextResponse.redirect(
    new URL(
      `/login?redirect=${encodeURIComponent(redirect)}&error=${encodeURIComponent("Legacy auth callback is disabled. Configure Neon Auth.")}`,
      request.url,
    ),
  );
}
