import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { listEvents, listTicketCategories } from "@/backend/modules/events";

export const dynamic = "force-dynamic";

export default function EventsPage() {
  const events = listEvents();

  return (
    <main className="min-h-screen bg-bg-dark px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <Badge tone="dark" className="border border-line bg-white/6">
          Public events
        </Badge>
        <h1 className="poster-text mt-4 text-6xl uppercase md:text-8xl">
          GatePass events
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-text-soft">
          Browse live event records with server-backed categories, QR-ready checkout,
          and scanner validation.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const categories = listTicketCategories(event.id);
            const lowestPrice = Math.min(...categories.map((category) => category.pricePaisa));
            return (
              <SurfaceCard key={event.id} className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--gp-champagne)]">
                  {event.eventType} / {event.status}
                </p>
                <h2 className="mt-3 font-serif text-4xl">{event.title}</h2>
                <p className="mt-2 text-sm text-text-soft">
                  {event.venue}, {event.city ?? "India"}
                </p>
                <p className="mt-4 text-sm text-text-soft">
                  From Rs {(lowestPrice / 100).toLocaleString("en-IN")} / {categories.length} categories
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/events/${event.slug ?? event.id}`}
                    className="rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink"
                  >
                    View event
                  </Link>
                  <Link
                    href={`/book/${event.slug ?? event.id}`}
                    className="rounded-full border border-line px-5 py-3 text-sm font-bold uppercase tracking-[0.12em]"
                  >
                    Book pass
                  </Link>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      </div>
    </main>
  );
}
