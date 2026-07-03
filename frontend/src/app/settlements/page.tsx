import { SettlementsPage } from "@/components/gatepass/admin-pages";
import { getServerSession } from "@/authO/lib/server/session";
import { redirect } from "next/navigation";

export default async function PublicSettlementsAliasPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/settlements");
  if (session.role !== "owner") redirect("/app");
  return <SettlementsPage />;
}
