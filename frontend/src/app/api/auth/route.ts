import { NextRequest, NextResponse } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { authEmailSchema } from "@/backend/core/schemas";
import { getServerSession, setSessionCookie, clearSessionCookie } from "@/authO/lib/server/session";
import { getNeonAuth, isNeonAuthConfigured } from "@/authO/lib/server/neon-auth";

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

    if (isNeonAuthConfigured()) {
      const auth = getNeonAuth();
      if (!auth) throw new Error("Neon Auth is not configured");
      const result =
        payload.mode === "signup"
          ? await auth.signUp.email({
              email: payload.email,
              password: payload.password,
              name: payload.name || payload.email.split("@")[0],
            })
          : await auth.signIn.email({ email: payload.email, password: payload.password });

      if (result && "error" in result && result.error) {
        throw new Error(result.error.message || "Neon authentication failed");
      }

      return NextResponse.json({ ok: true, redirectTo, provider: "neon" });
    }

    if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH !== "true") {
      return NextResponse.json({ message: "Neon Auth is not configured" }, { status: 503 });
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
