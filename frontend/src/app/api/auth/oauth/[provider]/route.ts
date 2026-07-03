import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseAuthConfigured, setSessionCookie } from "@/authO/lib/server/session";
import { getAppUrl, getSupabasePublishableKey, getSupabaseUrl } from "@/utils/supabase/env";

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

  if (isSupabaseAuthConfigured()) {
    const supabase = createClient(
      getSupabaseUrl(),
      getSupabasePublishableKey(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getAppUrl(request)}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error || !data.url) {
      return NextResponse.json({ message: error?.message || "OAuth redirect could not be created" }, { status: 400 });
    }
    return NextResponse.redirect(data.url);
  }

  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH !== "true") {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Authentication provider is not configured")}`, request.url));
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
