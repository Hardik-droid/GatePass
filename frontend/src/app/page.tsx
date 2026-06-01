import Link from "next/link";
import { ArrowRight, CalendarPlus, Compass } from "lucide-react";
import { CategoryRail, EventCard, EventRail, PublicNavbar, TrustStrip } from "@/components/gatepass/public-components";
import { MotionShell } from "@/components/gatepass/motion-shell";
import { events, homepageSections } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--gp-base-light)] text-[var(--ink)]">
      <PublicNavbar />
      <MotionShell>
        <section className="relative overflow-hidden border-b border-[#0a7f8f]/10 bg-[#fafafa] px-4 py-20 md:px-8 md:py-28">
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto flex min-w-0 max-w-5xl flex-col items-center text-center">
              <p className="luxury-label inline-flex rounded-full border border-[#0a7f8f]/14 bg-white px-5 py-2 text-xs font-bold uppercase text-[var(--gp-brand-primary)] shadow-[0_14px_40px_rgba(10,127,143,.08)]">
                GatePass GPS
              </p>
              <h1 className="luxury-display mx-auto mt-7 w-full max-w-[900px] text-[clamp(4rem,7vw,7.4rem)] font-bold leading-[.88] text-[var(--ink)]">
                Own the gate. Run the event.
              </h1>
              <p className="mx-auto mt-7 w-full max-w-2xl text-base leading-8 text-[var(--ink)]/68 md:text-lg">
                Ticketing, QR entry, GPS gatepass, live attendance, and settlement clarity for modern organizers.
              </p>
              <div className="mt-10 flex w-full flex-wrap justify-center gap-3">
                <Link href="/dashboard/events/new" className="luxury-label inline-flex items-center gap-2 rounded-full bg-[var(--gp-brand-primary)] px-6 py-3 text-xs font-bold uppercase text-white shadow-[0_18px_45px_rgba(10,127,143,.18)] transition-transform hover:-translate-y-1 hover:bg-[#086b78]">
                  <CalendarPlus className="h-4 w-4" /> Create Event
                </Link>
                <Link href="/explore" className="luxury-label inline-flex items-center gap-2 rounded-full border border-[#0a7f8f]/16 bg-white px-6 py-3 text-xs font-bold uppercase text-[var(--gp-brand-primary)] shadow-[0_14px_38px_rgba(10,127,143,.08)] transition-transform hover:-translate-y-1 hover:border-[#0a7f8f]/34 hover:bg-[#0a7f8f]/5">
                  <Compass className="h-4 w-4" /> Explore Experiences
                </Link>
              </div>
              <div className="mt-12 w-full">
                <CategoryRail />
              </div>
              <div className="luxury-label mt-7 rounded-full border border-[#0a7f8f]/10 bg-white px-5 py-2 text-[0.66rem] uppercase text-[var(--ink)]/58 shadow-[0_12px_34px_rgba(10,127,143,.06)]">
                Verified access interface
              </div>
            </div>
          </div>
        </section>
      </MotionShell>

      <section className="px-4 pb-14 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <EventCard event={events[0]} large />
            <div className="grid gap-5 md:grid-cols-2">
              {events.slice(1, 5).map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
          {homepageSections.map((section, index) => (
            <EventRail key={section} title={section} filter={index === 1 ? "luxury" : index === 2 ? "concert" : index === 3 ? "concert" : index === 4 ? "hostel" : index === 5 ? "workshop" : index === 6 ? "secure" : undefined} />
          ))}

          <section className="relative my-16 overflow-hidden rounded-[34px] border border-[#f7efd9]/14 bg-[linear-gradient(135deg,rgba(53,40,32,.92),rgba(29,20,15,.96)),linear-gradient(90deg,rgba(200,170,99,.18),transparent_55%)] p-6 shadow-[0_38px_90px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.08),inset_0_-1px_0_rgba(0,0,0,.45)] md:p-12">
            <div className="pointer-events-none absolute inset-px rounded-[33px] bg-[linear-gradient(120deg,rgba(255,255,255,.08),transparent_30%,rgba(200,170,99,.08)_100%)] opacity-65 [mask-image:linear-gradient(#000,transparent_88%)]" />
            <div className="relative z-10">
              <p className="luxury-label inline-flex items-center gap-3 text-xs font-bold uppercase text-[var(--gp-champagne)] before:h-px before:w-10 before:bg-[linear-gradient(90deg,transparent,var(--gp-champagne))]">
                Organizer operating system
              </p>
              <div className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-center">
                <h2 className="luxury-display max-w-4xl text-[clamp(4rem,7.4vw,8.4rem)] font-bold leading-[.86] text-[#fff7e3] drop-shadow-[0_8px_36px_rgba(0,0,0,.52)]">
                  From first ticket to final settlement.
                </h2>
                <Link
                  href="/dashboard"
                  className="luxury-label inline-flex min-h-22 w-full max-w-80 items-center justify-center gap-4 rounded-full border border-[#fff7e3]/70 bg-[linear-gradient(135deg,rgba(255,250,234,.98),rgba(228,212,176,.96))] px-7 py-5 text-center text-xs font-bold uppercase text-[#3d2d19]/80 shadow-[0_22px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.7)] transition-transform duration-300 hover:-translate-y-1 lg:w-[250px]"
                >
                  <span>Open<br />Workspace</span>
                  <ArrowRight className="h-6 w-6 text-[var(--gp-bronze)]" />
                </Link>
              </div>
            </div>
            <div className="relative z-10 mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {["Create", "Sell", "Scan", "Track", "Settle"].map((step, index) => (
                <div
                  key={step}
                  className="min-h-36 rounded-[24px] border border-[#f7efd9]/10 bg-[linear-gradient(145deg,rgba(28,22,17,.92),rgba(15,11,8,.92))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_18px_35px_rgba(0,0,0,.25)] transition duration-300 hover:-translate-y-1.5 hover:border-[#c8aa63]/45 hover:bg-[linear-gradient(145deg,rgba(43,31,24,.98),rgba(18,13,10,.98))]"
                >
                  <span className="luxury-label text-xs font-bold uppercase text-[var(--gp-champagne)]">0{index + 1}</span>
                  <p className="luxury-display mt-7 text-4xl font-bold leading-none text-[#fff8e8]">{step}</p>
                </div>
              ))}
            </div>
            <div className="luxury-label relative z-10 mx-auto mt-10 flex w-[min(560px,90%)] items-center justify-center gap-4 text-center text-xs uppercase text-[#c8aa63]/70 before:h-px before:flex-1 before:bg-[linear-gradient(90deg,transparent,rgba(200,170,99,.65),transparent)] after:h-px after:flex-1 after:bg-[linear-gradient(90deg,transparent,rgba(200,170,99,.65),transparent)]">
              Private ledger grade interface
            </div>
          </section>
          <TrustStrip />
        </div>
      </section>

      <footer className="border-t border-[#0a7f8f]/10 px-4 py-10 text-sm text-[var(--ink)]/58 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>GatePass GPS: launch events, sell passes, scan entries, track movement, reconcile money.</p>
          <div className="flex gap-4">
            <Link href="/dashboard/audit">Audit</Link>
            <Link href="/dashboard/settings">Privacy</Link>
            <Link href="/dashboard/architecture">Architecture</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
