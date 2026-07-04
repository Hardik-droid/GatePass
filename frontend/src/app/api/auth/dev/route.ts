import { NextRequest, NextResponse } from "next/server";
import { isDevAuthEnabled } from "@/utils/supabase/env";
import { clearSessionCookie, setSessionCookie } from "@/authO/lib/server/session";

function safeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

export async function POST(request: NextRequest) {
  if (!isDevAuthEnabled()) {
    return NextResponse.json({ message: "Dev auth is disabled" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirect") || "/app");
  const email = searchParams.get("email") || "owner@gatepass.local";
  const name = searchParams.get("name") || "Dev Owner";
  const role = searchParams.get("role") === "scanner" ? "scanner" : searchParams.get("role") === "attendee" ? "attendee" : "owner";

  const response = NextResponse.json({ ok: true, redirectTo, devMode: true });
  clearSessionCookie(response);
  setSessionCookie(response, {
    userId: `dev_${email.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`,
    email,
    name,
    provider: "dev",
    role,
  });

  return response;
}
