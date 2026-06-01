import Link from "next/link";
import { ArrowRight, Music2, QrCode, Sparkles } from "lucide-react";
import { EventCard, PublicNavbar } from "@/components/gatepass/public-components";
import { events } from "@/lib/mock-data";

export default function PartiesPage() {
  const list = events.filter((event) => event.theme === "party");
  return (
    <main className="min-h-screen bg-[var(--gp-club-black)] text-white">
      <PublicNavbar />
      <section className="relative min-h-[calc(100svh-68px)] overflow-hidden px-4 py-20 md:px-8 md:py-28">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/boilerroom/aftermovie-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(255,43,214,.36),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(31,182,255,.34),transparent_28%),radial-gradient(circle_at_50%_78%,rgba(125,255,60,.18),transparent_26%),linear-gradient(180deg,rgba(5,5,9,.62),rgba(5,5,9,.86)_62%,#050509_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,.14)_45%,transparent_55%)]" />
        <div className="absolute left-8 top-28 hidden h-48 w-1 rotate-12 rounded-full bg-[var(--gp-neon-pink)] blur-[2px] md:block" />
        <div className="absolute right-16 top-32 hidden h-56 w-1 -rotate-12 rounded-full bg-[var(--gp-electric-blue)] blur-[2px] md:block" />

        <div className="relative z-10 mx-auto flex min-h-[70svh] max-w-6xl flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/38 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-fuchsia-100 backdrop-blur-md">
            <Music2 className="h-4 w-4 text-[var(--gp-neon-pink)]" />
            Nightlife by GatePass
          </div>
          <h1 className="mt-7 max-w-5xl text-[clamp(4.5rem,10vw,11rem)] font-black uppercase leading-[.78] tracking-normal text-white drop-shadow-[0_0_42px_rgba(255,43,214,.34)]">
            Scan. Enter. No chaos.
          </h1>
          <p className="mt-7 max-w-2xl text-base font-semibold text-white/78 md:text-xl">
            DJ nights, club drops, VIP tables, afterparties, and QR entry that keeps the door moving.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gp-neon-pink)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_44px_rgba(255,43,214,.38)] transition-transform hover:-translate-y-1"
            >
              <Sparkles className="h-4 w-4" />
              Find a party
            </Link>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200/38 bg-white/10 px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/16"
            >
              <QrCode className="h-4 w-4 text-cyan-200" />
              Open scanner
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--gp-neon-pink)]">Tonight&apos;s room list</p>
            <h2 className="mt-3 text-5xl font-black uppercase leading-none md:text-7xl">Club heat, clean gates.</h2>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-cyan-200">
            Explore all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...list, ...events.filter((event) => event.theme === "concert").slice(0, 2)].map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}
