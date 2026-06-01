import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { authEmailSchema } from "@/backend/core/schemas";
import { getServerSession, isSupabaseAuthConfigured, setSessionCookie, clearSessionCookie } from "@/authO/lib/server/session";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await getServerSession();
    return { authenticated: Boolean(session), session };
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parseJson(request, authEmailSchema);
    const redirectTo = payload.redirectTo || "/app";

    if (isSupabaseAuthConfigured()) {
      const supabase = createClient(
        String(process.env.NEXT_PUBLIC_SUPABASE_URL),
        String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
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
      setSessionCookie(response, {
        userId: result.data.user.id,
        email: result.data.user.email || payload.email,
        name: String(result.data.user.user_metadata?.name ?? payload.name ?? ""),
        provider: "email",
        role: "attendee",
      });
      return response;
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
  clearSessionCookie(response);
  return response;
}
