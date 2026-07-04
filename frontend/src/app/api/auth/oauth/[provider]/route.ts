import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/authO/lib/server/session";
import { isDevAuthEnabled } from "@/utils/env";
import { isNeonAuthConfigured } from "@/authO/lib/server/neon-auth";

type Params = { provider: string };

function safeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "apple") {
    return NextResponse.json({ message: "Unsupported auth provider" }, { status: 400 });
  }

  const redirect = safeRedirect(request.nextUrl.searchParams.get("redirect") || "/app");

  if (isNeonAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        `/login?redirect=${encodeURIComponent(redirect)}&error=${encodeURIComponent("Use Neon Auth email sign-in until social OAuth is enabled in Neon Auth.")}`,
        request.url,
      ),
    );
  }

  if (!isDevAuthEnabled()) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Neon Auth is not configured")}`, request.url));
  }

  const response = NextResponse.redirect(new URL(redirect, request.url));
  setSessionCookie(response, {
    userId: `dev_${provider}_user`,
    email: `${provider}@gatepass.local`,
    name: `${provider[0].toUpperCase()}${provider.slice(1)} Dev User`,
    provider,
    role: "attendee",
  });
  return response;
}
