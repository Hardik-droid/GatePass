import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseAuthConfigured, setSessionCookie } from "@/authO/lib/server/session";

type Params = { provider: string };

function appUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "apple") {
    return NextResponse.json({ message: "Unsupported auth provider" }, { status: 400 });
  }

  const redirect = request.nextUrl.searchParams.get("redirect") || "/app";

  if (isSupabaseAuthConfigured()) {
    const supabase = createClient(
      String(process.env.NEXT_PUBLIC_SUPABASE_URL),
      String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${appUrl(request)}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error || !data.url) {
      return NextResponse.json({ message: error?.message || "OAuth redirect could not be created" }, { status: 400 });
    }
    return NextResponse.redirect(data.url);
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
