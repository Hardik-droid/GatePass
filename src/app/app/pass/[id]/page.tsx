import { PassClient } from "@/components/gatepass/pass-client";
import { getStore } from "@/backend/core/store";
import { getTicket } from "@/backend/modules/tickets";

export default async function PassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token = "" } = await searchParams;
  const ticket = getTicket(id);
  const event = ticket
    ? getStore().events.find((entry) => entry.id === ticket.eventId)
    : undefined;

  return (
    <main className="min-h-screen bg-[var(--gp-base-light)] px-4 py-8 text-[var(--ink)] md:px-8">
      <div className="mx-auto max-w-xl">
        <PassClient
          ticketId={id}
          token={token}
          eventTitle={event?.title ?? "GatePass event"}
          attendeeName={ticket?.attendeeName ?? "Attendee"}
          status={ticket?.status ?? "issued"}
        />
      </div>
    </main>
  );
}
