import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseAuthConfigured, setSessionCookie } from "@/lib/server/session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirect = request.nextUrl.searchParams.get("redirect") || "/app";
  if (!code || !isSupabaseAuthConfigured()) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Authentication callback is invalid")}`, request.url));
  }

  const supabase = createClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || "Authentication failed")}`, request.url));
  }

  const provider = data.user.app_metadata?.provider === "apple" ? "apple" : data.user.app_metadata?.provider === "google" ? "google" : "email";
  const response = NextResponse.redirect(new URL(redirect, request.url));
  setSessionCookie(response, {
    userId: data.user.id,
    email: data.user.email || "",
    name: String(data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? ""),
    provider,
    role: "attendee",
  });
  return response;
}

