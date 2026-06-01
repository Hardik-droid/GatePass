import { Suspense } from "react";
import { PublicNavbar } from "@/components/gatepass/public-components";
import { BookingClient } from "@/components/gatepass/booking-client";
import { getEventBySlug, listEvents, listTicketCategories } from "@/backend/modules/events";

export default async function BookingFlowPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const event = getEventBySlug(eventSlug) ?? listEvents()[0];
  const categories = listTicketCategories(event.id);

  return (
    <main className="min-h-screen bg-[var(--gp-base-light)] text-[var(--ink)]">
      <PublicNavbar />
      <Suspense fallback={<div className="min-h-screen bg-[#f2f5f9] flex items-center justify-center text-gray-500">Loading checkout...</div>}>
        <BookingClient event={event} categories={categories} />
      </Suspense>
    </main>
  );
}
