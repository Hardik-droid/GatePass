import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "@/authO/lib/server/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/dashboard");
  if (session.role !== "owner") redirect("/app");
  return children;
}
