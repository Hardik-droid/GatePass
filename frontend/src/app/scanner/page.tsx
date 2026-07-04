import { redirect } from "next/navigation";
import { getServerSession } from "@/authO/lib/server/session";
import { ScannerPageUI } from "@/components/gatepass/scanner-ui";
import { isDevAuthEnabled } from "@/utils/supabase/env";

export default async function ScannerPage() {
  const session = await getServerSession();
  const devMode = isDevAuthEnabled();

  // In dev mode allow any session (or even no session) to access the scanner
  if (!devMode) {
    if (!session) redirect("/login?redirect=/scanner");
    if (session.role !== "owner" && session.role !== "scanner") redirect("/app");
  }

  return <ScannerPageUI />;
}
