import { EventCard, PublicNavbar, SectionHero } from "@/components/gatepass/public-components";
import { MapPanel } from "@/components/gatepass/admin-components";
import { events } from "@/lib/mock-data";

export default function HostelGatePassPage() {
  return (
    <main className="min-h-screen bg-[var(--gp-base-light)] text-[var(--ink)]">
      <PublicNavbar />
      <SectionHero eyebrow="Hostel gate pass" title="Exit approved. Return tracked. Gate secure." text="Night-out passes, day-out approvals, parent contact, return windows, guard scan, and GPS-aware hostel movement logs." theme="hostel" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-8 lg:grid-cols-[.8fr_1fr]">
        <MapPanel />
        <EventCard event={events.find((event) => event.theme === "hostel") ?? events[4]} large />
      </section>
    </main>
  );
}
