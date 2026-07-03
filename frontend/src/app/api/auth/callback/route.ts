import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseAuthConfigured } from "@/authO/lib/server/session";
import { upsertUserProfile } from "@/backend/db/supabase";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";

function safeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirect = safeRedirect(request.nextUrl.searchParams.get("redirect") || "/app");
  if (!code || !isSupabaseAuthConfigured()) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Authentication callback is invalid")}`, request.url));
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || "Authentication failed")}`, request.url));
  }

  const response = NextResponse.redirect(new URL(redirect, request.url));
  await upsertUserProfile({
    id: data.user.id,
    name: String(data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? ""),
    email: data.user.email || "",
  });
  return response;
}
