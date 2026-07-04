import { NextResponse } from "next/server";
import { checkStateProvider } from "@/backend/core/store";
import { getNeonAuthConfigStatus } from "@/authO/lib/server/session";

export const runtime = "nodejs";

export async function GET() {
  const database = await checkStateProvider();
  const auth = getNeonAuthConfigStatus();

  return NextResponse.json({
    ok: database.provider === "neon" && database.ok && auth.configured && auth.cookieSecretLengthOk,
    database,
    auth,
    missing: {
      databaseUrl: database.provider !== "neon",
      neonAuthBaseUrl: !auth.hasBaseUrl,
      neonAuthCookieSecret: !auth.hasCookieSecret,
      neonAuthCookieSecretLength: auth.hasCookieSecret && !auth.cookieSecretLengthOk,
    },
  });
}
