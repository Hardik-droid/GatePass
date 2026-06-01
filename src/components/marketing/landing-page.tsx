"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ArrowRight, CalendarPlus, ChartColumn, CheckCircle2, MapPin, Play, QrCode, ScanLine, Wallet, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

const lineupRows = [
  { text: "COLLEGE FESTS", className: "row-a text-[19vw] md:text-[10rem] xl:text-[12rem]", variant: "solid" },
  { text: "HOSTEL PASSES", className: "row-b ml-[12vw] text-[17vw] md:text-[9rem] xl:text-[10rem]", variant: "outline" },
  { text: "WORKSHOPS", className: "row-c -ml-[4vw] text-[18vw] md:text-[9.7rem] xl:text-[11rem]", variant: "solid" },
  { text: "LOCAL SHOWS", className: "row-d ml-[18vw] text-[15vw] md:text-[7.5rem] xl:text-[8.6rem]", variant: "muted" },
  { text: "OPEN MICS", className: "row-e text-[18vw] md:text-[9.5rem] xl:text-[11rem]", variant: "outline" },
];

const proofCards = [
  {
    icon: QrCode,
    title: "Secure QR ticket lifecycle",
    text: "Every ticket moves through clean states from issue to gate validation, refund, or expiry.",
  },
  {
    icon: ScanLine,
    title: "Event-day scanner control",
    text: "Mobile web scanner, duplicate detection, gate logs, and instant validation under pressure.",
  },
  {
    icon: ChartColumn,
    title: "Live control room clarity",
    text: "Watch sold vs checked-in, gate flow, invalid attempts, and category-level attendance in real time.",
  },
  {
    icon: Wallet,
    title: "Settlement you can explain",
    text: "Gross sales, manual collections, gateway fees, refunds, and net payable stay reconciled.",
  },
];

const productStats = [
  ["Tickets sold", "1,284"],
  ["Checked in", "1,096"],
  ["Manual tickets", "112"],
  ["Duplicate scans", "03"],
];

const globeEvents = [
  { title: "SUGGA", city: "Mumbai", src: "/boilerroom/sugga.jpg", href: "/events/afterglow-arena-live" },
  { title: "SHERAL CELAN", city: "Delhi", src: "/boilerroom/sheral-celan.jpg", href: "/events/afterglow-arena-live" },
  { title: "PANJABI", city: "Chandigarh", src: "/boilerroom/panjabi.jpg", href: "/events/afterglow-arena-live" },
  { title: "ROSSI", city: "Berlin", src: "/boilerroom/rossi-boilerroom.jpg", href: "/events/afterglow-arena-live" },
  { title: "JCOB", city: "Paris", src: "/boilerroom/jcob.jpg", href: "/events/afterglow-arena-live" },
  { title: "GORO", city: "London", src: "/boilerroom/goro.jpg", href: "/events/afterglow-arena-live" },
  { title: "D DOUBLE", city: "Live now", src: "/boilerroom/d-double.webp", href: "/events/afterglow-arena-live" },
  { title: "HELLP", city: "Archive", src: "/boilerroom/hellp.jpg", href: "/reports" },
];

const routeCards = [
  ["Organizer workspace", "/app-home.jpg", "/dashboard", "image"],
  ["Public event page", "/app-event-page.jpg", "/events/afterglow-arena-live", "image"],
  ["Scanner and gate flow", "/app-tickets.jpg", "/scanner", "scanner"],
  ["Settlement and exports", "/smartboard.jpg", "/settlements", "image"],
];

const locationsList = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai",
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

function MarketingNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"locations" | "colleges">("locations");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-line bg-black/35 px-4 py-3 backdrop-blur-xl relative z-50">
        <Link href="/" className="poster-text text-2xl uppercase">
          GatePass
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden w-[420px] items-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-ink md:flex transition-colors hover:bg-white/90"
          >
            <span className="mr-3 h-2.5 w-2.5 rounded-full bg-violet" />
            <span className="flex-1 text-left">Search events, schools, clubs or city</span>
            <Search className="h-4 w-4 text-ink/60" />
          </button>
          
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-[24px] border border-white/12 bg-[#161616] p-2 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col z-[60] max-h-[60vh]">
              <div className="flex rounded-full bg-black/40 p-1 mb-3">
                <button 
                  onClick={() => setActiveTab("locations")}
                  className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "locations" ? "bg-white text-ink" : "text-white/60 hover:text-white"}`}
                >
                  Locations
                </button>
                <button 
                  onClick={() => setActiveTab("colleges")}
                  className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "colleges" ? "bg-white text-ink" : "text-white/60 hover:text-white"}`}
                >
                  Colleges
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2 pb-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {activeTab === "locations" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {locationsList.map((loc) => (
                      <button key={loc} className="rounded-xl px-3 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                        {loc}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {collegesList.map((college) => (
                      <button key={college} className="rounded-xl px-3 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                        {college}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button href="/dashboard" variant="ghost" className="hidden md:inline-flex">
            Dashboard
          </Button>
          <Button href="/events">Create event</Button>
        </div>
      </div>
    </header>
  );
}

function RouteCardsSection() {
  return (
    <section className="route-cards-section relative bg-bg-night px-4 py-18 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
        {routeCards.map(([title, src, href, preview]) => (
          <Link key={title} href={href} className="block">
            <SurfaceCard className="route-card overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10">
              <div className="relative h-52 overflow-hidden rounded-[22px]">
                {preview === "scanner" ? (
                  <div className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_50%_38%,rgba(214,255,87,0.24),transparent_34%),linear-gradient(135deg,#111_0%,#232323_100%)] p-5">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-white/62">
                      <span>Gate scan</span>
                      <span className="rounded-full bg-lime px-2 py-1 text-ink">Live</span>
                    </div>
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[24px] border border-white/22 bg-white text-ink shadow-[0_20px_70px_rgba(214,255,87,0.2)]">
                      <QrCode className="h-18 w-18" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                      <div className="rounded-2xl bg-white/10 px-3 py-2 text-white">
                        <CheckCircle2 className="mb-1 h-4 w-4 text-lime" />
                        Valid
                      </div>
                      <div className="rounded-2xl bg-white/10 px-3 py-2 text-white/72">
                        <ScanLine className="mb-1 h-4 w-4 text-violet" />
                        Camera
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image src={src} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
                )}
              </div>
              <div className="flex items-center justify-between px-2 pb-2 pt-5">
                <div>
                  <p className="poster-text text-3xl uppercase">{title}</p>
                  <p className="mt-2 text-sm text-text-soft">Production-ready route scaffold</p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/70" />
              </div>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

function GlobeDiscovery() {
  return (
    <section className="globe-section relative min-h-[112svh] overflow-hidden bg-black px-4 pb-14 pt-28 text-center md:px-8 md:pt-32">
      <div className="absolute left-1/2 top-0 h-[116vw] min-h-[780px] w-[150vw] -translate-x-1/2 md:-left-[18vw] md:h-[108vw] md:w-[136vw] md:translate-x-0">
        <Image
          src="/boilerroom/globe-fallback.jpg"
          alt="Globe background"
          fill
          priority
          className="globe-bg object-cover object-center opacity-[0.82]"
          sizes="100vw"
        />
      </div>
      <video
        className="globe-video absolute inset-0 h-full w-full object-cover object-center opacity-70"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/boilerroom/aftermovie-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,.76)_14%,rgba(0,0,0,.18)_52%,rgba(0,0,0,.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[70svh] max-w-7xl flex-col items-center justify-center">
        <p className="globe-kicker mb-5 text-xs font-black uppercase tracking-[0.36em] text-lime">
          Underground events worldwide
        </p>
        <h1 className="globe-logo poster-text text-[22vw] uppercase text-white md:text-[13rem] xl:text-[16rem]">
          GatePass
        </h1>
        <p className="globe-copy mt-5 max-w-2xl text-sm font-semibold uppercase tracking-[0.16em] text-white/76 md:text-base">
          Find the room, book the ticket, scan the gate, and keep the night moving.
        </p>
        <div className="globe-cta mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/events"
            className="inline-flex h-11 w-56 items-center justify-center gap-2 bg-lime px-6 text-sm font-black uppercase tracking-[0.08em] text-ink transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white md:w-72"
          >
            <MapPin className="h-4 w-4" />
            Find an Event
          </Link>
          <Link
            href="/events/afterglow-arena-live"
            className="inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-semibold text-white/84 transition-colors duration-300 hover:text-white"
          >
            Browse the archive
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-6 grid max-w-7xl grid-cols-2 gap-3 md:-mt-16 md:grid-cols-4">
        {globeEvents.map((event, index) => (
          <Link
            key={event.title}
            href={event.href}
            className={`globe-card group block overflow-hidden rounded-[28px] border border-white/12 bg-white/8 p-2 text-left shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 ${
              index % 3 === 1 ? "md:mt-10" : index % 3 === 2 ? "md:-mt-6" : ""
            }`}
          >
            <div className="relative h-44 overflow-hidden rounded-[22px] md:h-56">
              <Image
                src={event.src}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-transparent" />
              <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/72 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-white">
                <Play className="h-3 w-3 fill-white" />
                Live
              </div>
            </div>
            <div className="flex items-end justify-between px-2 py-4">
              <div>
                <p className="poster-text text-3xl uppercase text-white md:text-4xl">{event.title}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/54">{event.city}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-white/70 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FloatingCard({
  src,
  title,
  badge,
  tone,
  className,
}: {
  src: string;
  title: string;
  badge: string;
  tone: "lime" | "violet" | "red" | "dark";
  className: string;
}) {
  return (
    <div className={`floating-card absolute z-30 w-40 md:w-52 ${className}`}>
      <div className="overflow-hidden rounded-[26px] bg-white p-2 shadow-2xl">
        <div className="relative h-48 overflow-hidden rounded-[22px] md:h-64">
          <Image src={src} alt={title} fill className="object-cover" sizes="(max-width: 768px) 160px, 208px" />
        </div>
        <div className="flex items-center justify-between px-2 py-3 text-ink">
          <span className="text-xs font-black uppercase tracking-[0.12em]">{title}</span>
          <Badge tone={tone}>{badge}</Badge>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.05,
    });

    const onTick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const ctx = gsap.context(() => {
      if (media.matches) return;

      gsap.from(".globe-kicker, .globe-logo, .globe-copy, .globe-cta", {
        opacity: 0,
        y: 44,
        scale: 0.97,
        stagger: 0.08,
        ease: "power3.out",
        duration: 1,
      });

      gsap.from(".globe-card", {
        opacity: 0,
        y: 90,
        x: (index) => (index % 2 === 0 ? -28 : 28),
        scale: 0.9,
        rotate: (index) => (index % 2 === 0 ? -3 : 3),
        stagger: 0.055,
        ease: "power3.out",
        duration: 1,
        delay: 0.18,
      });

      gsap.to(".globe-bg", {
        y: -110,
        scale: 1.14,
        ease: "none",
        scrollTrigger: {
          trigger: ".globe-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".globe-card", {
        y: (index) => (index % 2 === 0 ? -78 : 54),
        rotate: (index) => (index % 2 === 0 ? 2 : -2),
        ease: "none",
        scrollTrigger: {
          trigger: ".globe-section",
          start: "35% top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.from(".route-card", {
        y: 54,
        scale: 0.97,
        stagger: 0.08,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".route-cards-section",
          start: "top 88%",
          end: "top 42%",
          scrub: true,
        },
      });

      gsap.to(".hero-shell", {
        opacity: 0.16,
        scale: 0.94,
        y: -70,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.from(".hero-card", {
        opacity: 0,
        y: 42,
        scale: 0.96,
        stagger: 0.08,
        ease: "power3.out",
        duration: 0.9,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".lineup-section",
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });

      timeline
        .fromTo(".lineup-backdrop", { opacity: 0.1 }, { opacity: 1, ease: "none", duration: 0.18 }, 0)
        .fromTo(".lineup-shell", { backgroundColor: "#111111" }, { backgroundColor: "#f7f7f4", ease: "none", duration: 1 }, 0)
        .fromTo(".row-a", { yPercent: 38, xPercent: -4 }, { yPercent: -66, xPercent: 8, ease: "none" }, 0)
        .fromTo(".row-b", { yPercent: -18, xPercent: 10 }, { yPercent: 36, xPercent: -9, ease: "none" }, 0)
        .fromTo(".row-c", { yPercent: 32, xPercent: -10 }, { yPercent: -54, xPercent: 8, ease: "none" }, 0)
        .fromTo(".row-d", { yPercent: -28, xPercent: 16 }, { yPercent: 26, xPercent: -12, ease: "none" }, 0)
        .fromTo(".row-e", { yPercent: 56, xPercent: 4 }, { yPercent: -40, xPercent: -8, ease: "none" }, 0)
        .fromTo(".float-a", { opacity: 0, x: -180, y: 100, scale: 0.85, rotate: -10 }, { opacity: 1, x: 90, y: -90, scale: 1, rotate: 5, ease: "none" }, 0.06)
        .fromTo(".float-b", { opacity: 0, x: 170, y: -80, scale: 0.85, rotate: 9 }, { opacity: 1, x: -130, y: 120, scale: 1, rotate: -5, ease: "none" }, 0.12)
        .fromTo(".float-c", { opacity: 0, x: -60, y: 180, scale: 0.85, rotate: 8 }, { opacity: 1, x: 150, y: -70, scale: 1, rotate: -6, ease: "none" }, 0.2)
        .fromTo(".float-d", { opacity: 0, x: 120, y: 120, scale: 0.85, rotate: -8 }, { opacity: 1, x: -170, y: -120, scale: 1, rotate: 6, ease: "none" }, 0.28);

      gsap.from(".proof-card", {
        opacity: 0,
        y: 80,
        scale: 0.96,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".proof-grid",
          start: "top 85%",
          end: "top 35%",
          scrub: true,
        },
      });

      gsap.from(".stat-card", {
        opacity: 0,
        y: 48,
        scale: 0.97,
        stagger: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 86%",
          end: "top 44%",
          scrub: true,
        },
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="noise-layer relative overflow-x-hidden">
      <MarketingNav />
      <GlobeDiscovery />
      <RouteCardsSection />

      <section className="hero-section relative min-h-screen px-4 pb-24 pt-30 md:px-8 md:pt-34">
        <div className="hero-shell mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <Badge tone="dark" className="border border-line bg-white/6">
              Organizer-first ticketing OS
            </Badge>
            <h1 className="poster-text mt-6 max-w-5xl text-[15vw] uppercase md:text-[8rem] xl:text-[10rem]">
              Launch events. control the gate. trust the numbers.
            </h1>
            <p className="mt-7 max-w-xl text-lg text-text-soft">
              GatePass gives schools, campuses, hostels, workshops, and local organizers clean event-day control with secure QR passes and transparent settlement logic.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-ink shadow-[0_16px_44px_rgba(214,255,87,0.22)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white"
              >
                <CalendarPlus className="h-4 w-4" />
                Create event
              </Link>
              <Button href="/scanner" variant="ghost" className="gap-2 border-white/28 bg-white/10 text-white hover:bg-white/16">
                <ScanLine className="h-4 w-4" />
                Open scanner
              </Button>
            </div>
            <div className="mt-14 grid gap-3 md:grid-cols-3">
              {[
                ["Campus concert", "Campus sale live", "/kettama.jpg"],
                ["Workshop", "Manual + online", "/sara-landry.jpg"],
                ["Hostel pass", "Guard-ready scan", "/mind-against.jpg"],
              ].map(([title, text, src]) => (
                <SurfaceCard key={title} className="hero-card overflow-hidden p-3">
                  <div className="relative h-40 overflow-hidden rounded-[22px]">
                    <Image src={src} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 240px" />
                  </div>
                  <div className="px-2 pb-2 pt-4">
                    <p className="poster-text text-3xl uppercase">{title}</p>
                    <p className="mt-2 text-sm text-text-soft">{text}</p>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -left-6 top-12 hidden rounded-full border border-line bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70 md:block">
              Live control room
            </div>
            <div className="glass-phone relative mx-auto w-[320px] rounded-[42px] border border-white/12 bg-black p-3 shadow-2xl md:w-[360px]">
              <div className="overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,#161616_0%,#222_100%)] p-5">
                <div className="mb-8 flex items-center justify-between text-sm font-bold uppercase tracking-[0.14em] text-white/70">
                  <span>GatePass</span>
                  <Badge tone="lime">Live</Badge>
                </div>
                <div className="poster-text text-[4.5rem] uppercase leading-none md:text-[5.5rem]">
                  Grab your ticket.
                </div>
                <p className="mt-4 max-w-[16rem] text-sm text-text-soft">
                  Sell paid and manual tickets, issue QR passes, and keep every gate scan accountable.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button href="/dashboard" className="flex-1">
                    Dashboard
                  </Button>
                  <Button href="/reports" variant="ghost" className="flex-1">
                    Reports
                  </Button>
                </div>
                <div className="relative mt-6 h-48 overflow-hidden rounded-[28px]">
                  <Image src="/app-event-page.jpg" alt="GatePass app mockup" fill className="object-cover" sizes="360px" priority />
                </div>
                <div className="mt-6 space-y-3">
                  {productStats.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
                      <span className="text-sm font-medium text-white/72">{label}</span>
                      <span className="poster-text text-2xl uppercase">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lineup-section relative h-screen">
        <div className="lineup-shell absolute inset-0 overflow-hidden bg-bg-dark">
          <div className="lineup-backdrop absolute inset-0 bg-bg-paper" />
          <div className="absolute left-4 top-24 z-20 md:left-10">
            <Badge tone="dark">Pinned kinetic lineup</Badge>
          </div>
          <div className="absolute inset-x-[-8vw] top-1/2 z-10 -translate-y-1/2">
            {lineupRows.map((row) => {
              const tone =
                row.variant === "outline"
                  ? "text-transparent [text-shadow:none] [-webkit-text-stroke:1.5px_#121212]"
                  : row.variant === "muted"
                    ? "text-black/24"
                    : "text-ink";

              return (
                <div key={row.text} className={`marquee-row poster-text uppercase ${tone} ${row.className}`}>
                  {row.text}
                </div>
              );
            })}
          </div>

          <FloatingCard src="/kettama.jpg" title="Campus concert" badge="Campus" tone="lime" className="float-a left-[6vw] top-[18vh]" />
          <FloatingCard src="/sara-landry.jpg" title="Workshop" badge="Live now" tone="violet" className="float-b right-[8vw] top-[10vh]" />
          <FloatingCard src="/black-coffee.jpg" title="Hostel pass" badge="Approved" tone="red" className="float-c bottom-[10vh] left-[20vw]" />
          <FloatingCard src="/whomadewho.jpg" title="Open mic" badge="Exclusive" tone="dark" className="float-d bottom-[18vh] right-[16vw]" />
        </div>
      </section>

      <section className="relative bg-bg-paper px-4 py-24 text-ink md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <Badge tone="violet">Product proof</Badge>
            <h2 className="poster-text mt-5 text-[13vw] uppercase md:text-[6rem]">
              QR clarity, scanner speed, and settlement trust.
            </h2>
            <p className="mt-5 max-w-2xl text-lg text-black/62">
              GatePass is not another discovery marketplace. It is an organizer workspace, ticket engine, scanner, control room, and reporting layer built for real event pressure.
            </p>
          </div>

          <div className="proof-grid mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {proofCards.map(({ icon: Icon, title, text }) => (
              <SurfaceCard key={title} className="proof-card bg-white p-6 text-ink shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-black/62">{text}</p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section relative bg-bg-night px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <Badge tone="red">Launch with control</Badge>
              <h2 className="poster-text mt-5 text-[13vw] uppercase md:text-[6rem]">
                Launch your event with full control.
              </h2>
            </div>
            <div className="flex gap-3">
              <Button href="/events">Create event</Button>
              <Button href="/dashboard" variant="ghost">
                Book demo
              </Button>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
