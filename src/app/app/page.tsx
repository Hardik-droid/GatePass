import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, MapPinned, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/gatepass/admin-components";
import { LogoutButton } from "@/components/gatepass/logout-button";
import { getStore } from "@/backend/core/store";
import { getServerSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/app");
  const store = getStore();
  const tickets = store.tickets.filter(
    (ticket) => ticket.attendeeEmail === session.email,
  );
  return (
    <main className="min-h-screen bg-[#101713] px-4 py-8 text-white md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[420px_1fr]">
        <section className="rounded-[32px] border border-[var(--gp-champagne)]/24 bg-white/6 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gp-champagne)]">
            My passes
          </p>
          <div className="mt-5 grid gap-3">
            {tickets.length ? tickets.map((ticket) => {
              const event = store.events.find((entry) => entry.id === ticket.eventId);
              return (
                <div key={ticket.id} className="rounded-2xl bg-black/24 p-4">
                  <p className="font-bold">{event?.title ?? "GatePass event"}</p>
                  <p className="mt-1 text-sm text-white/52">{ticket.attendeeName} / {ticket.id}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <StatusBadge status={ticket.status} />
                    <Link href={`/app/pass/${ticket.id}`} className="text-sm font-bold text-[var(--gp-champagne)]">
                      Open pass
                    </Link>
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-2xl border border-dashed border-white/15 p-5 text-white/58">
                Book a pass from an event page and it will appear here immediately.
              </div>
            )}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gp-champagne)]">Attendee app</p>
            <LogoutButton />
          </div>
          <h1 className="mt-3 font-serif text-6xl">Your active pass is ready.</h1>
          <p className="mt-3 text-sm font-semibold text-white/52">Signed in as {session.email}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["GPS permission", "Allowed", MapPinned],
              ["Upcoming events", `${tickets.length} passes`, Bell],
              ["Refund/cancel", "No open request", ShieldCheck],
              ["Entry instructions", "Use Main Gate before 10 PM", ShieldCheck],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                <Icon className="h-5 w-5 text-[var(--gp-champagne)]" />
                <p className="mt-6 text-sm text-white/52">{label as string}</p>
                <p className="font-serif text-3xl">{value as string}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Approved", "Pending", "Expired", "Checked In", "Outside Geofence"].map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
          <Link href="/app/request" className="mt-8 inline-flex rounded-full bg-[var(--gp-champagne)] px-6 py-3 font-black uppercase tracking-[0.12em] text-[var(--gp-espresso)]">
            Request gatepass
          </Link>
        </section>
      </div>
    </main>
  );
}
