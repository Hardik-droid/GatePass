import Image from "next/image";
import Link from "next/link";
import { Crown, Music2, QrCode, Sparkles } from "lucide-react";
import { EventCard, PublicNavbar } from "@/components/gatepass/public-components";
import { QRPassCard } from "@/components/gatepass/admin-components";
import { events, ticketCategories } from "@/lib/mock-data";

export default function ConcertsPage() {
  return (
    <main className="min-h-screen bg-[var(--gp-espresso)] text-white">
      <PublicNavbar />
      <section className="relative min-h-[calc(100svh-68px)] overflow-hidden px-4 py-20 md:px-8 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,176,106,.22),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(91,20,23,.34),transparent_30%),linear-gradient(145deg,#080604_0%,#1b120d_48%,#060403_100%)]" />
        <div className="concert-light-sweep absolute inset-0 opacity-45" />
        <div className="absolute left-1/2 top-[10%] h-[min(72vw,760px)] w-[min(72vw,760px)] -translate-x-1/2 md:left-[66%] md:top-[7%]">
          <div className="concert-globe relative h-full w-full">
            <Image
              src="/boilerroom/globe-fallback.jpg"
              alt="Concert globe visual"
              fill
              priority
              className="object-contain opacity-80 drop-shadow-[0_0_70px_rgba(201,176,106,.28)]"
              sizes="(max-width: 768px) 90vw, 760px"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,8,6,.94)_0%,rgba(12,8,6,.74)_43%,rgba(12,8,6,.2)_72%,rgba(12,8,6,.76)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--gp-espresso)] to-transparent" />

        <div className="relative z-10 mx-auto grid min-h-[68svh] max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,.95fr)_minmax(380px,.55fr)]">
          <div>
            <div className="luxury-label inline-flex items-center gap-3 rounded-full border border-[#c9b06a]/22 bg-black/24 px-4 py-2 text-xs font-bold uppercase text-[var(--gp-champagne)] backdrop-blur-md">
              <Music2 className="h-4 w-4" />
              Live music ledger
            </div>
            <h1 className="luxury-display mt-7 max-w-5xl text-[clamp(4.5rem,8.5vw,10.5rem)] font-bold leading-[.82] text-[#fff7e3] drop-shadow-[0_14px_54px_rgba(0,0,0,.65)]">
              Stage lights. Champagne gates.
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-[var(--gp-cream)]/76">
              Premium concert discovery with artist-led cards, clean ticket tiers, countdown moments, and QR entry that feels effortless at the venue.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="luxury-label inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#fff8e7,#c9b06a)] px-6 py-3.5 text-xs font-bold uppercase text-[var(--gp-espresso)] shadow-[0_22px_60px_rgba(0,0,0,.42)] transition-transform hover:-translate-y-1"
              >
                <Sparkles className="h-4 w-4" />
                Explore concerts
              </Link>
              <Link
                href="/scanner"
                className="luxury-label inline-flex items-center gap-2 rounded-full border border-[#f7efd9]/22 bg-white/8 px-6 py-3.5 text-xs font-bold uppercase text-[var(--gp-cream)] backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/12"
              >
                <QrCode className="h-4 w-4 text-[var(--gp-champagne)]" />
                QR entry preview
              </Link>
            </div>
          </div>

          <div className="hidden rounded-[34px] border border-[#c9b06a]/20 bg-[#fff6df]/8 p-5 shadow-[0_38px_90px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-md lg:block">
            <div className="rounded-[28px] border border-[#f7efd9]/10 bg-black/24 p-5">
              <div className="flex items-center justify-between">
                <span className="luxury-label text-xs font-bold uppercase text-[var(--gp-champagne)]">Featured concert</span>
                <Crown className="h-5 w-5 text-[var(--gp-champagne)]" />
              </div>
              <p className="luxury-display mt-10 text-5xl font-bold leading-none text-[#fff7e3]">Afterglow Arena Live</p>
              <p className="mt-4 text-sm leading-6 text-white/62">North Stage, Delhi / Sun, 2 Jun / Tiered QR access</p>
              <div className="mt-7 grid grid-cols-3 gap-2 text-center">
                {["VIP", "Early", "Student"].map((tier) => (
                  <span key={tier} className="rounded-full bg-[#c9b06a]/16 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f2dfad]">{tier}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:px-8 lg:grid-cols-[1fr_.7fr]">
        <div className="lg:col-span-2">
          <p className="luxury-label text-xs font-bold uppercase text-[var(--gp-champagne)]">Curated concert rooms</p>
          <h2 className="luxury-display mt-3 text-5xl font-bold leading-none text-[#fff7e3] md:text-7xl">Elegant discovery. Serious entry control.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {events.filter((event) => ["concert", "party"].includes(event.theme)).map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
        <div className="grid gap-5">
          <QRPassCard />
          <div className="rounded-[28px] border border-[#c9b06a]/18 bg-[linear-gradient(145deg,rgba(45,34,27,.86),rgba(28,20,15,.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.05),0_16px_40px_rgba(0,0,0,.22)]">
            <p className="luxury-label text-xs font-bold uppercase text-[var(--gp-champagne)]">Ticket tiers</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ticketCategories.slice(0, 7).map((tier) => (
                <span key={tier} className="rounded-full bg-[#c9b06a]/14 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[#f2dfad]">{tier}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
