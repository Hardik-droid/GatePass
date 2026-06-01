"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Crown,
  LocateFixed,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { categoryRail, events, publicNav, trustItems } from "@/lib/mock-data";
import type { EventItem } from "@/types/gatepass";

const themeClass: Record<EventItem["theme"], string> = {
  luxury: "bg-[var(--gp-luxury-base)] text-[var(--ink)] border-[#8d6c37]/15 shadow-[0_20px_70px_rgba(141,108,55,.08)]",
  party: "bg-[var(--gp-party-base)] text-[var(--ink)] border-[#d32f4d]/15 shadow-[0_20px_70px_rgba(211,47,77,.08)]",
  concert: "bg-[var(--gp-concert-base)] text-[var(--ink)] border-[#0a7f8f]/15 shadow-[0_20px_70px_rgba(10,127,143,.08)]",
  hostel: "bg-[var(--gp-hostel-base)] text-[var(--ink)] border-[#2d8f5f]/15 shadow-[0_20px_70px_rgba(45,143,95,.08)]",
  secure: "bg-[var(--gp-secure-base)] text-[var(--ink)] border-[#0a7f8f]/15 shadow-[0_20px_70px_rgba(10,127,143,.08)]",
  workshop: "bg-[var(--gp-workshop-base)] text-[var(--ink)] border-[#6b4d38]/15 shadow-[0_20px_70px_rgba(107,77,56,.08)]",
};

const locationsList = [
  "Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai",
  "Kolkata", "Chandigarh", "Ahmedabad", "Jaipur", "Goa", "Berlin", "Paris", "London", "New York"
];

const collegesList = [
  "Thapar Institute of Engineering and Technology",
  "BITS Pilani",
  "VIT Vellore",
  "SRM Institute of Science and Technology",
  "Manipal Institute of Technology (MIT)",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Warangal",
  "Delhi University",
  "Christ University",
  "Symbiosis International University",
  "Amity University",
  "Lovely Professional University (LPU)",
  "Chandigarh University"
];

export function PublicNavbar() {
  const [city, setCity] = useState("Mumbai");
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"locations" | "colleges">("locations");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    params.set("city", city);
    window.location.href = `/explore?${params.toString()}`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#0a7f8f]/10 bg-[#fafafa]/88 px-4 py-3 text-[var(--ink)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <Link href="/" className="font-serif text-3xl uppercase tracking-[0.12em] text-[var(--gp-brand-primary)]">
          GatePass
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="hidden items-center gap-2 rounded-full border border-[#0a7f8f]/15 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[#0a7f8f]/30 hover:bg-[#0a7f8f]/5 md:flex"
            title="Change city or college"
          >
            <LocateFixed className="h-4 w-4 text-[var(--gp-brand-primary)]" />
            <span className="max-w-[150px] truncate">{city}</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-[#0a7f8f]/15 bg-[#fafafa]/95 p-2 shadow-xl backdrop-blur-xl flex flex-col z-[60] max-h-[60vh]">
              <div className="flex rounded-full bg-black/5 p-1 mb-2">
                <button 
                  type="button"
                  onClick={() => setActiveTab("locations")}
                  className={`flex-1 rounded-full py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "locations" ? "bg-[var(--gp-brand-primary)] text-white" : "text-[var(--ink)]/60 hover:text-[var(--ink)]"}`}
                >
                  Locations
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab("colleges")}
                  className={`flex-1 rounded-full py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "colleges" ? "bg-[var(--gp-brand-primary)] text-white" : "text-[var(--ink)]/60 hover:text-[var(--ink)]"}`}
                >
                  Colleges
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-1 pb-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#0a7f8f]/10 hover:[&::-webkit-scrollbar-thumb]:bg-[#0a7f8f]/20">
                {activeTab === "locations" ? (
                  <div className="grid grid-cols-2 gap-1">
                    {locationsList.map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => {
                          setCity(loc);
                          setIsDropdownOpen(false);
                        }}
                        className={`rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors truncate ${city === loc ? "bg-[#0a7f8f]/10 text-[var(--gp-brand-primary)]" : "text-[var(--ink)]/80 hover:bg-[#0a7f8f]/5 hover:text-[var(--gp-brand-primary)]"}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {collegesList.map((college) => (
                      <button
                        type="button"
                        key={college}
                        onClick={() => {
                          setCity(college);
                          setIsDropdownOpen(false);
                        }}
                        className={`rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors truncate ${city === college ? "bg-[#0a7f8f]/10 text-[var(--gp-brand-primary)]" : "text-[var(--ink)]/80 hover:bg-[#0a7f8f]/5 hover:text-[var(--gp-brand-primary)]"}`}
                        title={college}
                      >
                        {college}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gp-brand-primary)]" />
          <label htmlFor="public-search" className="sr-only">Search events</label>
          <input
            id="public-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-full border border-[#0a7f8f]/12 bg-white pl-11 pr-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[#6f7476] focus:border-[#0a7f8f]/40"
            placeholder="Search events, passes, venues or city"
          />
        </form>
        <nav className="hidden items-center gap-5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--ink)]/68 lg:flex">
          {publicNav.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--gp-brand-primary)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/login" className="ml-auto rounded-full bg-[var(--gp-brand-primary)] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_14px_36px_rgba(10,127,143,.18)] transition hover:bg-[#086b78]">
          Login / Signup
        </Link>
      </div>
    </header>
  );
}

export function CategoryRail() {
  const getHref = (category: string) =>
    category === "Parties"
      ? "/parties"
      : category === "Concerts"
        ? "/concerts"
        : category === "Hostel Gate Pass"
          ? "/hostel-gate-pass"
          : category === "Gatepass"
            ? "/gatepass"
            : "/explore";

  const pillClass = (index: number) =>
    `category-pill group relative isolate inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.12em] shadow-[0_10px_30px_rgba(10,127,143,.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gp-brand-primary)] ${
      index === 0
        ? "border-[var(--gp-brand-primary)] bg-[var(--gp-brand-primary)] text-white hover:shadow-[0_20px_55px_rgba(10,127,143,.2)]"
        : "border-[#0a7f8f]/14 bg-white text-[var(--ink)] hover:border-[#0a7f8f]/35 hover:bg-[#0a7f8f]/6 hover:text-[var(--gp-brand-primary)] hover:shadow-[0_18px_50px_rgba(10,127,143,.12)]"
    }`;

  const content = (category: string) => (
    <>
      <span className="relative z-10">{category}</span>
      <span className="relative z-10 max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-4 group-hover:opacity-100">
        -&gt;
      </span>
    </>
  );

  return (
    <div className="category-rail-loop no-scrollbar relative overflow-hidden py-5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="category-rail-track flex w-max gap-4 px-4">
        {categoryRail.map((category, index) => (
          <Link href={getHref(category)} key={category} className={pillClass(index)}>
            {content(category)}
          </Link>
        ))}
        {categoryRail.map((category, index) => (
          <span key={`${category}-loop`} aria-hidden="true" className={pillClass(index)}>
            {content(category)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function EventCard({ event, large = false }: { event: EventItem; large?: boolean }) {
  const pillClass = "bg-[#0a7f8f]/8 text-[var(--gp-brand-primary)]";

  return (
    <Link href={`/events/${event.slug}`} className={`group block overflow-hidden rounded-[28px] border p-3 ${themeClass[event.theme]}`}>
      <div className={`relative overflow-hidden rounded-[22px] ${large ? "h-80" : "h-56"}`}>
        <Image src={event.image} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes={large ? "640px" : "320px"} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
          {event.category}
        </div>
      </div>
      <div className="grid gap-4 p-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-3xl leading-none text-[var(--ink)] md:text-4xl">
              {event.title}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--ink)]/68">
              <MapPin className="h-4 w-4 text-[var(--gp-brand-primary)]" />
              {event.venue}, {event.city}
            </p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
          <span className={`rounded-full px-3 py-1 ${pillClass}`}>{event.date}</span>
          <span className={`rounded-full px-3 py-1 ${pillClass}`}>{event.price}</span>
          <span className={`rounded-full px-3 py-1 ${pillClass}`}>{event.status}</span>
        </div>
      </div>
    </Link>
  );
}

export function EventRail({ title, filter }: { title: string; filter?: EventItem["theme"] }) {
  const list = useMemo(() => (filter ? events.filter((event) => event.theme === filter) : events.slice(0, 5)), [filter]);
  return (
    <section className="py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-serif text-4xl text-[var(--ink)] md:text-6xl">{title}</h2>
        <Link href="/explore" className="hidden items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--gp-brand-primary)] md:flex">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
        {list.map((event) => (
          <div key={event.slug} className="w-[330px] shrink-0 md:w-[390px]">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function VisualMockup() {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-4">
      {[
        ["QR Ticket", Ticket, "GP-QR-8F42", "Signed token only"],
        ["Gate Scan", ShieldCheck, "VALID", "Main Gate / 6:42 PM"],
        ["Revenue", Crown, "Rs 42.8L", "Net settlement clear"],
        ["GPS Zone", MapPin, "Inside geofence", "Last update 18s ago"],
      ].map(([label, Icon, value, meta]) => (
        <div key={label as string} className="min-h-48 min-w-0 rounded-[28px] border border-[#0a7f8f]/10 bg-white p-5 shadow-[0_24px_70px_rgba(10,127,143,.1)]">
          <div className="flex items-center justify-between">
            <span className="max-w-[8rem] text-xs font-black uppercase tracking-[0.16em] text-[var(--gp-brand-primary)]">{label as string}</span>
            <Icon className="h-5 w-5 text-[var(--gp-brand-primary)]" />
          </div>
          <p className="mt-7 break-words font-serif text-[clamp(2rem,3vw,3rem)] leading-none text-[var(--ink)]">{value as string}</p>
          <p className="mt-3 max-w-[11rem] text-sm leading-5 text-[var(--ink)]/62">{meta as string}</p>
        </div>
      ))}
    </div>
  );
}

export function TrustStrip() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {trustItems.slice(0, 10).map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="group relative grid min-h-24 place-items-center overflow-hidden rounded-[20px] border border-[#0a7f8f]/10 bg-white p-5 text-center shadow-[0_16px_44px_rgba(10,127,143,.08)]"
        >
          <div className="absolute inset-0 bg-[#0a7f8f]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Icon className="relative z-10 h-6 w-6 text-[var(--gp-brand-primary)]" />
          <p className="luxury-label relative z-10 mt-2 text-[0.68rem] font-bold uppercase text-[var(--ink)]/74">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function SectionHero({
  eyebrow,
  title,
  text,
  theme = "luxury",
}: {
  eyebrow: string;
  title: string;
  text: string;
  theme?: "luxury" | "party" | "concert" | "hostel" | "secure";
}) {
  const classes = {
    luxury: "bg-[var(--gp-luxury-base)] border-[#8d6c37]/12",
    party: "bg-[var(--gp-party-base)] border-[#d32f4d]/12",
    concert: "bg-[var(--gp-concert-base)] border-[#0a7f8f]/12",
    hostel: "bg-[var(--gp-hostel-base)] border-[#2d8f5f]/12",
    secure: "bg-[var(--gp-secure-base)] border-[#0a7f8f]/12",
  };
  return (
    <section className={`relative overflow-hidden border-b px-4 py-20 text-[var(--ink)] md:px-8 md:py-28 ${classes[theme]}`}>
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--gp-brand-primary)]">{eyebrow}</p>
          <h1 className="mt-5 font-serif text-6xl leading-[.9] md:text-8xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--ink)]/68">{text}</p>
        </div>
        <CategoryRail />
      </div>
    </section>
  );
}

