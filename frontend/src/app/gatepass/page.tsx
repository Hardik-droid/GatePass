import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  Fingerprint,
  MapPinned,
  QrCode,
  RadioTower,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { TicketLifecycle } from "@/components/gatepass/admin-components";
import { EventCard, PublicNavbar } from "@/components/gatepass/public-components";
import { events } from "@/lib/mock-data";

const privateEvents = events.filter((event) => event.theme === "secure");

const useCases = [
  ["Hostels", "Night-out pass, parent approval, return window, guard scan.", UserCheck],
  ["Campuses", "Student movement, concert volunteer access, emergency flags.", BadgeCheck],
  ["Factories", "Shift exit, visitor movement, gate audit, device logs.", Building2],
  ["Offices", "Employee gatepass, vendor access, GPS checkpoint trail.", Fingerprint],
];

const workflow = ["Submitted", "Pending Approval", "Approved", "Active", "Checked Out", "Returned / Expired"];

const guardStats = ["GPS geofence", "Approval ledger", "Guard scanner", "Audit trail"];

export default function GatepassPage() {
  return (
    <main className="min-h-screen bg-[#090d0b] text-white">
      <PublicNavbar />

      <section className="relative overflow-hidden border-b border-[#c9b06a]/12 px-4 py-20 md:px-8 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(201,176,106,.22),transparent_30%),radial-gradient(circle_at_20%_28%,rgba(15,42,34,.74),transparent_34%),linear-gradient(135deg,#0b100d_0%,#1a120d_52%,#080604_100%)]" />
        <div className="absolute inset-x-[8vw] top-10 h-px bg-gradient-to-r from-transparent via-[#c9b06a]/45 to-transparent" />
        <div className="absolute inset-0 opacity-[.08] [background-image:repeating-linear-gradient(90deg,rgba(255,248,231,.55)_0_1px,transparent_1px_92px)]" />

        <div className="relative z-10 mx-auto flex min-h-[62svh] max-w-6xl flex-col items-center justify-center text-center">
          <div className="luxury-label inline-flex items-center gap-3 rounded-full border border-[#c9b06a]/28 bg-[#fff8e7]/7 px-5 py-2 text-[0.68rem] font-bold uppercase text-[var(--gp-champagne)] backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Private gatepass systems
          </div>
          <h1 className="luxury-display mt-8 text-[clamp(4rem,8.2vw,9.8rem)] font-bold leading-[.84] text-[#fff7e3] drop-shadow-[0_18px_70px_rgba(0,0,0,.62)]">
            Secure movement. Quiet control.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base font-semibold leading-8 text-[var(--gp-cream)]/72 md:text-lg">
            Approval-led GPS gatepasses for hostels, campuses, factories, and offices.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/app/request"
              className="luxury-label inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#fff8e7,#c9b06a)] px-7 py-3.5 text-xs font-bold uppercase text-[var(--gp-espresso)] shadow-[0_22px_60px_rgba(0,0,0,.38)] transition-transform hover:-translate-y-1"
            >
              <UserCheck className="h-4 w-4" />
              Request pass
            </Link>
            <Link
              href="/app/gps"
              className="luxury-label inline-flex items-center gap-2 rounded-full border border-[#f7efd9]/18 bg-black/18 px-7 py-3.5 text-xs font-bold uppercase text-[var(--gp-cream)] backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/8"
            >
              <MapPinned className="h-4 w-4 text-[var(--gp-champagne)]" />
              View GPS
            </Link>
          </div>
          <div className="mt-12 grid w-full max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {guardStats.map((label) => (
              <div key={label} className="luxury-label rounded-full border border-[#c9b06a]/18 bg-[#fff8e7]/6 px-4 py-3 text-[0.62rem] font-bold uppercase text-[#ead9a5] backdrop-blur-md">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="luxury-label text-xs font-bold uppercase text-[var(--gp-champagne)]">Private systems</p>
            <h2 className="luxury-display mt-3 text-5xl font-bold leading-none text-[#fff7e3] md:text-7xl">
              Controlled entry, exit, and return.
            </h2>
          </div>
          <Link href="/dashboard/gates" className="luxury-label inline-flex items-center gap-2 text-xs font-bold uppercase text-[var(--gp-champagne)]">
            Gate dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {privateEvents.map((event) => (
            <EventCard key={event.slug} event={event} large />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:px-8 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="luxury-label text-xs font-bold uppercase text-[var(--gp-champagne)]">Use cases</p>
          <h2 className="luxury-display mt-3 text-5xl font-bold leading-none text-[#fff7e3] md:text-7xl">
            Built for private movement, not public ticketing.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--gp-cream)]/68">
            Separate workflows for students, staff, guards, employees, vendors, visitors, and emergency exceptions.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {useCases.map(([title, copy, Icon]) => (
            <div
              key={title as string}
              className="rounded-[28px] border border-[#c9b06a]/16 bg-[linear-gradient(145deg,rgba(45,34,27,.76),rgba(13,26,21,.92))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.05),0_16px_40px_rgba(0,0,0,.22)]"
            >
              <Icon className="h-6 w-6 text-[var(--gp-champagne)]" />
              <h3 className="luxury-display mt-8 text-4xl font-bold leading-none text-[#fff7e3]">{title as string}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{copy as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="rounded-[34px] border border-[#c9b06a]/18 bg-[linear-gradient(135deg,rgba(53,40,32,.86),rgba(10,22,17,.96))] p-6 shadow-[0_38px_90px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.06)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div>
              <p className="luxury-label text-xs font-bold uppercase text-[var(--gp-champagne)]">Approval workflow</p>
              <h2 className="luxury-display mt-3 text-5xl font-bold leading-none text-[#fff7e3] md:text-7xl">
                Every pass has a state.
              </h2>
              <p className="mt-5 text-white/62">
                Submitted requests move through approval, activation, gate scan, return, expiry, or escalation.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {workflow.map((state, index) => (
                <div key={state} className="rounded-2xl border border-white/10 bg-black/24 p-5">
                  <span className="luxury-label text-xs font-bold text-[var(--gp-champagne)]">0{index + 1}</span>
                  <p className="mt-4 font-bold text-[#fff7e3]">{state}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <TicketLifecycle />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 md:px-8 lg:grid-cols-4">
        {[
          ["Guard scanner", "QR pass checked at the gate", QrCode],
          ["Emergency flag", "Escalate unsafe movement instantly", AlertTriangle],
          ["Live ops", "Control room sees gate state", RadioTower],
          ["Immutable audit", "Every manual action is logged", Clock3],
        ].map(([title, copy, Icon]) => (
          <div key={title as string} className="rounded-[28px] border border-[#c9b06a]/16 bg-white/[0.055] p-6">
            <Icon className="h-6 w-6 text-[var(--gp-champagne)]" />
            <h3 className="luxury-display mt-8 text-4xl font-bold leading-none text-[#fff7e3]">{title as string}</h3>
            <p className="mt-3 text-sm leading-6 text-white/58">{copy as string}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
