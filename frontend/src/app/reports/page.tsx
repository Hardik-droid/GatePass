import { ReportsPage } from "@/components/gatepass/admin-pages";
import { getServerSession } from "@/authO/lib/server/session";
import { redirect } from "next/navigation";

export default async function PublicReportsAliasPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/reports");
  if (session.role !== "owner") redirect("/app");
  return <ReportsPage />;
}
