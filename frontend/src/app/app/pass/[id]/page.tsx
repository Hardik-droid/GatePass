import { PassClient } from "@/components/gatepass/pass-client";
import { ensureStoreReady } from "@/backend/core/store";
import { getTicket } from "@/backend/modules/tickets";
import { canAccessTicket } from "@/backend/modules/auth";
import { getServerSession } from "@/authO/lib/server/session";
import { redirect } from "next/navigation";

export default async function PassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/app");
  const { id } = await params;
  const ticket = getTicket(id);
  if (ticket && !canAccessTicket(session, ticket)) {
    redirect("/app");
  }
  const store = await ensureStoreReady();
  const event = ticket
    ? store.events.find((entry) => entry.id === ticket.eventId)
    : undefined;

  return (
    <main className="min-h-screen bg-[var(--gp-base-light)] px-4 py-8 text-[var(--ink)] md:px-8">
      <div className="mx-auto max-w-xl">
        <PassClient
          ticketId={id}
          eventTitle={event?.title ?? "GatePass event"}
          attendeeName={ticket?.attendeeName ?? "Attendee"}
          status={ticket?.status ?? "issued"}
        />
      </div>
    </main>
  );
}
