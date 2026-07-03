import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { authEmailSchema } from "@/backend/core/schemas";
import { getServerSession, isSupabaseAuthConfigured, setSessionCookie, clearSessionCookie } from "@/authO/lib/server/session";
import { upsertUserProfile } from "@/backend/db/supabase";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";

function safeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

export async function GET() {
  return withErrorHandling(async () => {
    const session = await getServerSession();
    return { authenticated: Boolean(session), session };
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parseJson(request, authEmailSchema);
    const redirectTo = safeRedirect(payload.redirectTo);

    if (isSupabaseAuthConfigured()) {
      const cookieStore = await cookies();
      const supabase = createSupabaseServerClient(cookieStore);
      const result =
        payload.mode === "signup"
          ? await supabase.auth.signUp({
              email: payload.email,
              password: payload.password,
              options: { data: { name: payload.name || payload.email.split("@")[0] } },
            })
          : await supabase.auth.signInWithPassword({ email: payload.email, password: payload.password });

      if (result.error) throw new Error(result.error.message);
      if (!result.data.user) {
        return NextResponse.json({
          ok: true,
          needsConfirmation: true,
          message: "Check your email to confirm your GatePass account.",
        });
      }

      const response = NextResponse.json({ ok: true, redirectTo });
      await upsertUserProfile({
        id: result.data.user.id,
        name: String(result.data.user.user_metadata?.name ?? payload.name ?? ""),
        email: result.data.user.email || payload.email,
      });
      return response;
    }

    if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH !== "true") {
      return NextResponse.json({ message: "Authentication provider is not configured" }, { status: 503 });
    }

    const response = NextResponse.json({ ok: true, redirectTo, devMode: true });
    setSessionCookie(response, {
      userId: `dev_${payload.email.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      provider: "dev",
      role: "attendee",
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Authentication failed" },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, redirectTo: "/login" });
  if (isSupabaseAuthConfigured()) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    await supabase.auth.signOut();
  }
  clearSessionCookie(response);
  return response;
}
