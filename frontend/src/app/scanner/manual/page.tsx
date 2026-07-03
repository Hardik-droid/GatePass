import { redirect } from "next/navigation";
import { getServerSession } from "@/authO/lib/server/session";
import { ScannerPageUI } from "@/components/gatepass/admin-pages";

export default async function ManualLookupPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/scanner/manual");
  if (session.role !== "owner" && session.role !== "scanner") redirect("/app");
  return <ScannerPageUI manual />;
}
