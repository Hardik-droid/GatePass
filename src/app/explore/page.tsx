"use client";

import { Crown, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryRail, EventCard, PublicNavbar } from "@/components/gatepass/public-components";
import { events } from "@/lib/mock-data";

const filters = ["All", "Parties", "Concerts", "Hostel Gate Pass", "Workshops", "Gatepass"];
const quickFilters = ["Tonight", "Near Mumbai", "QR ready"] as const;
type QuickFilter = (typeof quickFilters)[number];

function eventMatchesQuickFilter(event: (typeof events)[number], filter: QuickFilter) {
  const searchable = [
    event.title,
    event.category,
    event.date,
    event.time,
    event.city,
    event.venue,
    event.status,
    event.organizer,
    ...event.badges,
  ]
    .join(" ")
    .toLowerCase();

  if (filter === "Tonight") {
    return (
      event.date.toLowerCase() === "today" ||
      event.status.toLowerCase().includes("live") ||
      /\b(6|7|8|9|10|11|12):\d{2}\s?pm\b/i.test(event.time)
    );
  }

  if (filter === "Near Mumbai") {
    return event.city.toLowerCase() === "mumbai";
  }

  return /qr|scan|ticket|pass|bib|entry/.test(searchable);
}

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null);
  const [query, setQuery] = useState("");
  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const filterMatch =
        activeFilter === "All" ||
        event.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
        event.theme.toLowerCase() === activeFilter.toLowerCase() ||
        (activeFilter === "Gatepass" && event.theme === "secure");
      const queryMatch =
        !normalizedQuery ||
        [event.title, event.category, event.city, event.venue, event.organizer]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const quickFilterMatch =
        !activeQuickFilter || eventMatchesQuickFilter(event, activeQuickFilter);
      return filterMatch && queryMatch && quickFilterMatch;
    });
  }, [activeFilter, activeQuickFilter, query]);

  function toggleQuickFilter(filter: QuickFilter) {
    setActiveQuickFilter((current) => (current === filter ? null : filter));
    window.setTimeout(() => {
      document.getElementById("event-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[var(--gp-base-light)] text-[var(--ink)]">
      <PublicNavbar />
      <section className="relative overflow-hidden border-b border-[#0a7f8f]/10 bg-[#fafafa] px-4 py-20 md:px-8 md:py-28">
        <div className="relative z-10 mx-auto flex min-h-[58svh] max-w-6xl flex-col items-center justify-center text-center">
          <div className="luxury-label inline-flex items-center gap-3 rounded-full border border-[#0a7f8f]/14 bg-white px-5 py-2 text-[0.68rem] font-bold uppercase text-[var(--gp-brand-primary)] shadow-[0_14px_40px_rgba(10,127,143,.08)]">
            <Crown className="h-4 w-4" />
            Verified event access
          </div>
          <h1 className="luxury-display mt-8 text-[clamp(4rem,8vw,9.4rem)] font-bold leading-[.84] text-[var(--ink)]">
            Find your access point.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base font-semibold leading-8 text-[var(--ink)]/68 md:text-lg">
            Parties, concerts, workshops, hostel gate passes, and secure gatepass systems with clean QR verification.
          </p>
          <label className="relative mt-9 block w-full max-w-2xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gp-brand-primary)]" />
            <span className="sr-only">Search experiences</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-14 w-full rounded-full border border-[#0a7f8f]/14 bg-white pl-14 pr-5 text-sm font-bold text-[var(--ink)] shadow-[0_22px_60px_rgba(10,127,143,.1)] outline-none placeholder:text-[#6f7476] focus:border-[#0a7f8f]/42"
              placeholder="Search events, venues, clubs or city"
            />
          </label>
          <div className="mt-10 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
            {quickFilters.map((item) => {
              const active = activeQuickFilter === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleQuickFilter(item)}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gp-brand-primary)] active:scale-[0.98] ${
                    active
                      ? "border-[var(--gp-brand-primary)] bg-[var(--gp-brand-primary)] text-white shadow-[0_18px_50px_rgba(10,127,143,.18)]"
                      : "border-[#0a7f8f]/14 bg-white text-[var(--ink)] hover:-translate-y-0.5 hover:border-[#0a7f8f]/35 hover:bg-[#0a7f8f]/6 hover:text-[var(--gp-brand-primary)]"
                  }`}
                >
                  <Sparkles className={`h-4 w-4 ${active ? "text-white" : "text-[var(--gp-brand-primary)]"}`} />
                  {item}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm font-bold text-[var(--ink)]/58">
            {activeQuickFilter
              ? `${activeQuickFilter}: ${visibleEvents.length} matching experiences`
              : `${visibleEvents.length} experiences available`}
          </p>
        </div>
        <div className="relative z-10 mx-auto mt-2 max-w-7xl">
          <CategoryRail />
        </div>
      </section>
      <section id="event-results" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-8 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.12em] transition-colors ${
                activeFilter === filter
                  ? "border-[var(--gp-brand-primary)] bg-[var(--gp-brand-primary)] text-white"
                  : "border-[#0a7f8f]/14 bg-white hover:border-[#0a7f8f]/35 hover:bg-[#0a7f8f]/6 hover:text-[var(--gp-brand-primary)]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
        {visibleEvents.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-[#0a7f8f]/14 bg-white p-5 text-center font-bold text-[var(--ink)]/68">
            No experiences match this search.
          </p>
        ) : null}
      </section>
    </main>
  );
}
