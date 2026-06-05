"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppShell, AttendanceChart, AuditTimeline, EmptyState, MapPanel, MetricsGrid, OrdersTable, RevenueChart, ScannerResult, StatusBadge, TicketLifecycle } from "@/components/gatepass/admin-components";
import { auditEvents, ticketCategories } from "@/lib/mock-data";
import { QRScanner } from "@/components/gatepass/qr-scanner";

export function DashboardOverview() {
  return (
    <AppShell title="Control Room">
      <MetricsGrid />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <RevenueChart />
        <AttendanceChart />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <AuditTimeline />
        <QuickActions />
      </div>
    </AppShell>
  );
}

export function QuickActions() {
  const actions = [
    ["Create Event", "/dashboard/events/new"],
    ["Add Staff", "/dashboard/team"],
    ["Open Scanner", "/scanner"],
    ["View Reports", "/dashboard/reports"],
    ["Configure Payouts", "/dashboard/settlements"],
  ];

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
      <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/52">Quick actions</p>
      <div className="grid gap-3">
        {actions.map(([action, href]) => (
          <Link key={action} href={href} className="rounded-2xl bg-black/24 px-4 py-3 text-left font-bold hover:bg-white/8">
            {action}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BuilderPage() {
  const fields = ["Event name", "Event type", "Description", "Date/time", "Venue", "Poster upload", "Organizer details", "Capacity", "Refund policy", "Terms", "Help number", "Visibility"];
  const types = ["Public event", "Private event", "Invite-only event", "Internal campus event", "Paid workshop", "Free registration", "Donation-based event", "Hostel gate pass", "Multi-day concert"];
  return (
    <AppShell title="Event Builder">
      <div className="relative overflow-hidden rounded-[34px] border border-[#f7efd9]/14 bg-[linear-gradient(135deg,rgba(53,40,32,.92),rgba(29,20,15,.96)),linear-gradient(90deg,rgba(200,170,99,.18),transparent_55%)] p-6 shadow-[0_38px_90px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.08),inset_0_-1px_0_rgba(0,0,0,.45)] md:p-12">
        <div className="pointer-events-none absolute inset-px rounded-[33px] bg-[linear-gradient(120deg,rgba(255,255,255,.08),transparent_30%,rgba(200,170,99,.08)_100%)] opacity-65 [mask-image:linear-gradient(#000,transparent_88%)]" />
        <div className="relative z-10">
          <p className="luxury-label inline-flex items-center gap-3 text-xs font-bold uppercase text-[var(--gp-champagne)] before:h-px before:w-10 before:bg-[linear-gradient(90deg,transparent,var(--gp-champagne))]">
            Craft an Experience
          </p>
          <h2 className="luxury-display mt-5 max-w-4xl text-5xl font-bold leading-[.86] text-[#fff7e3] drop-shadow-[0_8px_36px_rgba(0,0,0,.52)]">
            Design your next event.
          </h2>

          <div className="mt-12 grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field} className="grid gap-2 rounded-[22px] border border-[#f7efd9]/10 bg-black/40 p-4 transition duration-300 hover:border-[#c8aa63]/45 hover:bg-[linear-gradient(145deg,rgba(43,31,24,.98),rgba(18,13,10,.98))]">
                  <span className="text-sm font-bold text-[var(--gp-champagne)]">{field}</span>
                  <input className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-[#fff8e8] outline-none transition focus:border-[var(--gp-champagne)]/50 focus:bg-white/10" placeholder={field} />
                </label>
              ))}
              
              <div className="mt-6 flex flex-col items-center justify-center rounded-[24px] border border-[#c8aa63]/30 bg-[linear-gradient(145deg,rgba(200,170,99,.15),transparent)] p-8 text-center shadow-[0_18px_35px_rgba(0,0,0,.25)] md:col-span-2">
                <h3 className="luxury-display mb-4 text-3xl font-bold text-[#fff8e8]">Ready to launch?</h3>
                <p className="mb-8 max-w-lg text-[#fff7e3]/70 text-sm">Your event will be instantly available on the GatePass GPS network. Review your details and let's make it live.</p>
                <button type="button" className="luxury-label inline-flex min-h-16 w-full max-w-sm items-center justify-center gap-4 rounded-full border border-[#fff7e3]/70 bg-[linear-gradient(135deg,rgba(255,250,234,.98),rgba(228,212,176,.96))] px-7 py-4 text-center text-sm font-bold uppercase text-[#3d2d19]/80 shadow-[0_22px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.7)] transition-transform duration-300 hover:-translate-y-1">
                  <span>Create Event Now</span>
                </button>
              </div>
            </div>
            
            <div className="rounded-[28px] border border-[#f7efd9]/10 bg-black/40 p-5 backdrop-blur-md">
              <p className="luxury-label text-sm font-black uppercase tracking-[0.18em] text-[var(--gp-champagne)]/80">Event types</p>
              <div className="mt-4 grid gap-2">
                {types.map((type) => (
                  <StatusBadge key={type} status={type} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function TicketManagerPage() {
  return (
    <AppShell title="Ticket Category Manager">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ticketCategories.map((category, index) => (
          <div key={category} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-serif text-3xl">{category}</p>
                <p className="mt-1 text-sm text-white/52">Sale start: today / Sale end: event day</p>
              </div>
              <StatusBadge status={index % 4 === 0 ? "Paused" : "Live"} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Price", index === 7 ? "Free" : `Rs ${299 + index * 100}`],
                ["Capacity", `${200 + index * 40}`],
                ["Sold", `${80 + index * 12}`],
                ["Checked-in", `${45 + index * 8}`],
                ["Unused", `${22 + index}`],
                ["Refunded", `${index % 5}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/24 p-3">
                  <p className="text-white/42">{label}</p>
                  <p className="font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function ControlRoomPage() {
  return (
    <AppShell title="Live Control Room">
      <MetricsGrid />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <AttendanceChart />
        <MapPanel />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["Main Gate: 42 scans/min", "VIP Gate: 11 scans/min", "East Gate: duplicate spike"].map((item) => (
          <div key={item} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 font-bold">{item}</div>
        ))}
      </div>
    </AppShell>
  );
}

export function GatesPage() {
  return (
    <AppShell title="Gate Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Main Gate", "East Gate", "VIP Desk", "Backstage", "Food Coupon Gate", "Volunteer Desk"].map((gate, index) => (
          <div key={gate} className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
            <div className="flex justify-between">
              <h2 className="font-serif text-3xl">{gate}</h2>
              <StatusBadge status={index === 2 ? "Closed" : "Online"} />
            </div>
            <div className="mt-5 grid gap-2 text-sm">
              {["Scanner device: Android Web", "Staff assigned: 3", `Scans/min: ${12 + index * 5}`, `Valid scans: ${220 + index * 41}`, `Failed scans: ${index + 2}`, `Duplicate scans: ${index}`, "Last sync: 18s ago", "Battery: 78%"].map((line) => (
                <div key={line} className="rounded-2xl bg-black/24 px-4 py-3">{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function OrdersPage() {
  return (
    <AppShell title="Orders and Ticket Lifecycle">
      <TicketLifecycle />
      <div className="mt-6 flex flex-wrap gap-2">
        {["Paid", "Manual", "Complimentary", "Refunded", "Cancelled", "Checked In", "Unused", "Expired"].map((filter) => (
          <StatusBadge key={filter} status={filter} />
        ))}
      </div>
      <div className="mt-6">
        <OrdersTable />
      </div>
    </AppShell>
  );
}

export function SettlementsPage() {
  const cards = ["Gross ticket sales", "Payment gateway fees", "GatePass platform fee", "Refunds", "Manual collections", "Net payable", "Settlement status", "Payout date"];
  const plans = ["Starter: Rs 0 setup, Rs 5 per paid ticket", "Pro: subscription, lower ticket fee, custom branding", "Enterprise: annual plan, team roles, priority support"];
  return (
    <AppShell title="Settlements">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div key={card} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
            <p className="text-sm text-white/52">{card}</p>
            <p className="mt-3 font-serif text-3xl">{index === 5 ? "Rs 38.1L" : index === 6 ? "Approved" : index === 7 ? "T+2" : `Rs ${12 + index}.4L`}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan} className="rounded-[28px] border border-[var(--gp-champagne)]/18 bg-white/[0.055] p-6 font-bold">{plan}</div>
        ))}
      </div>
      <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
        <p className="font-serif text-3xl">Add-on revenue</p>
        <p className="mt-3 text-white/62">WhatsApp delivery, custom branding, food coupons, badge printing, on-ground scanning, settlement support, analytics export, sponsored promotion.</p>
      </div>
    </AppShell>
  );
}

export function ReportsPage() {
  function exportReport(report: string) {
    const rows = [
      ["report", "generatedAt", "status"],
      [report, new Date().toISOString(), "ready"],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.toLowerCase().replaceAll(" ", "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="Reports">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Sales report", "Attendance report", "Category-wise report", "Settlement report", "Refund report", "Scan log report", "Manual ticket report", "Complimentary ticket report"].map((report) => (
          <div key={report} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
            <p className="font-serif text-3xl">{report}</p>
            <button type="button" onClick={() => exportReport(report)} className="mt-5 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/16">CSV export</button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {["Event", "Date range", "Ticket category", "Payment mode", "Gate", "Staff", "Status"].map((filter) => (
          <StatusBadge key={filter} status={filter} />
        ))}
      </div>
    </AppShell>
  );
}

export function AuditPage() {
  return (
    <AppShell title="Audit Logs">
      <AuditTimeline />
      <div className="mt-6 grid gap-4">
        {auditEvents.map((event) => (
          <div key={event.entityId} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
            <p className="font-bold">{event.actor} / {event.organization} / {event.event}</p>
            <p className="mt-2 text-white/58">{event.action} on {event.entityType} {event.entityId}. Old: {event.oldValue}. New: {event.newValue}. Metadata: {event.device}.</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function MatrixPage({ title, items }: { title: string; items: string[] }) {
  return (
    <AppShell title={title}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <div key={item} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
            <div className="flex justify-between">
              <p className="font-serif text-3xl">{item}</p>
              <StatusBadge status={index % 3 === 0 ? "Active" : "Ready"} />
            </div>
            <p className="mt-4 text-sm text-white/58">Connected to GatePass role, event, ticket, scanner, and reporting workflows.</p>
          </div>
        ))}
      </div>
      {items.length === 0 ? <EmptyState /> : null}
    </AppShell>
  );
}

export function ScannerPageUI({ manual = false }: { manual?: boolean }) {
  const [qrToken, setQrToken] = useState("");
  const [scanResult, setScanResult] = useState<Record<string, string> | null>(null);
  const [message, setMessage] = useState("");
  const [isCameraScanner, setIsCameraScanner] = useState(!manual);

  // Hook to set body/html background to full black on the scanner page
  useEffect(() => {
    const originalBodyBg = document.body.style.background;
    const originalHtmlBg = document.documentElement.style.background;

    document.body.style.background = "#000000";
    document.documentElement.style.background = "#000000";

    return () => {
      document.body.style.background = originalBodyBg;
      document.documentElement.style.background = originalHtmlBg;
    };
  }, []);

  // Helper to extract token from URL or raw text
  function extractToken(scannedText: string): string {
    try {
      if (scannedText.startsWith("http://") || scannedText.startsWith("https://")) {
        const url = new URL(scannedText);
        const token = url.searchParams.get("token");
        if (token) return token;

        const pathParts = url.pathname.split("/");
        const passIndex = pathParts.indexOf("pass");
        if (passIndex !== -1 && pathParts[passIndex + 1]) {
          return pathParts[passIndex + 1];
        }

        const gp1Part = pathParts.find(p => p.startsWith("GP1.") || p.includes("GP1."));
        if (gp1Part) return gp1Part;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    return scannedText;
  }

  async function handleScan(rawScannedText: string) {
    if (!rawScannedText) return;
    const scannedText = extractToken(rawScannedText.trim());
    setQrToken(scannedText);
    setMessage("Processing scanned QR...");

    if (scannedText.startsWith("GP1.")) {
      // Production MongoDB-based ticket
      try {
        const response = await fetch("/api/tickets/scan", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            qrPayload: scannedText,
            scannerId: "web-camera-scanner-01",
          }),
        });
        const payload = await response.json();
        if (payload.ok) {
          setScanResult({
            status: "VALID",
            message: "Entry allowed. Ticket validated successfully.",
            ticketId: payload.ticket?.ticketId || "unknown",
            attendeeName: payload.ticket?.email || "Attendee",
            category: "Student Ticket",
            payment: "Paid",
            checkedInAt: payload.ticket?.usedAt || new Date().toISOString(),
            gateName: "Main Gate",
          });
          setMessage("Scan successful! Ticket checked in.");
        } else {
          // Map MongoDB error states to ScannerResult states
          let mappedStatus = "INVALID";
          if (payload.reason === "ticket_used" || payload.reason === "ticket_checked_in" || payload.reason === "ticket_used_already") {
            mappedStatus = "ALREADY USED";
          } else if (payload.reason === "ticket_expired") {
            mappedStatus = "EXPIRED";
          }

          setScanResult({
            status: mappedStatus,
            message: `Scan rejected: ${payload.reason || "Invalid ticket"}`,
            ticketId: "unknown",
          });
          setMessage(`Rejected: ${payload.reason || "Invalid ticket"}`);
        }
      } catch (err) {
        console.error("MongoDB Scan validation failed:", err);
        setScanResult({
          status: "INVALID",
          message: "Database ticket scan verification failed.",
        });
        setMessage("Server error validating database ticket.");
      }
    } else {
      // Mock / Memory-based ticket
      const token = extractToken(scannedText);
      try {
        const response = await fetch("/api/scanner", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            eventId: "auto",
            gateId: "gate_main",
            deviceId: "web-scanner-01",
            scannerUserId: "usr_scanner_demo",
            qrToken: token,
          }),
        });
        const payload = await response.json();

        // Fetch detailed mock ticket info to fill ScannerResult card with nice values
        let details: Record<string, string> = {};
        if (payload.status === "VALID" || payload.status === "ALREADY USED") {
          try {
            const lookupResponse = await fetch("/api/scanner/manual-lookup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ query: payload.ticketId || token }),
            });
            const lookupPayload = await lookupResponse.json();
            if (lookupPayload.items?.length) {
              const ticket = lookupPayload.items[0];
              details = {
                attendeeName: ticket.attendeeName || ticket.attendeeEmail || "Attendee",
                category: ticket.ticketCategoryId === "vip" ? "VIP" : "General",
                payment: "Paid",
              };
            }
          } catch (lookupErr) {
            console.error("Mock details lookup failed:", lookupErr);
          }
        }

        setScanResult({
          status: payload.status,
          message: payload.message || `Scanned mock ticket: ${payload.status}`,
          ticketId: payload.ticketId || token,
          checkedInAt: payload.checkedInAt || payload.scannedAt || new Date().toISOString(),
          gateName: payload.gateName || "Main Gate",
          ...details,
        });
        setMessage(payload.message || `Mock Scan status: ${payload.status}`);
      } catch (err) {
        console.error("Mock scan verification failed:", err);
        setScanResult({
          status: "INVALID",
          message: "Mock ticket scan verification failed.",
        });
        setMessage("Server error validating mock ticket.");
      }
    }
  }

  async function submitScan() {
    if (!qrToken.trim()) {
      setMessage("Enter a ticket, phone, name, order, or token to search.");
      return;
    }
    await handleScan(qrToken.trim());
  }

  async function submitManualLookup() {
    if (!qrToken.trim()) {
      setMessage("Enter a ticket, phone, name, order, or token to search.");
      return;
    }
    const token = extractToken(qrToken.trim());
    setMessage("Searching database...");
    try {
      const response = await fetch("/api/scanner/manual-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: token }),
      });
      const payload = await response.json();
      if (payload.items?.length) {
        const ticket = payload.items[0];
        setScanResult({
          status: ticket.status === "checked_in" ? "ALREADY USED" : "VALID",
          message: `Found ticket for ${ticket.attendeeName}.`,
          ticketId: ticket.id,
          attendeeName: ticket.attendeeName,
          category: ticket.ticketCategoryId === "vip" ? "VIP" : "General",
          payment: "Paid",
          checkedInAt: ticket.checkedInAt || new Date().toISOString(),
          gateName: "Manual lookup",
        });
        setMessage(`Manual lookup found ticket for: ${ticket.attendeeName}`);
      } else {
        setScanResult({
          status: "INVALID",
          message: "No matching ticket found.",
          ticketId: "",
          gateName: "Manual lookup",
        });
        setMessage("No matching ticket found in database.");
      }
    } catch (err) {
      console.error("Manual lookup failed:", err);
      setMessage("Failed to run database lookup.");
    }
  }

  function markDecision(decision: string) {
    setMessage(decision);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8 max-w-full overflow-hidden">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="w-full overflow-hidden">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gp-champagne)]">Mobile web scanner</p>
            <h1 className="font-serif text-6xl break-words">{isCameraScanner ? "Scanner" : "Manual Lookup"}</h1>
            
            {/* Toggle bar between scanner modes */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCameraScanner(true)}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${
                  isCameraScanner
                    ? "bg-[var(--gp-champagne)] text-[var(--gp-espresso)] shadow-[0_0_15px_rgba(201,176,106,0.3)]"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                Camera Scan
              </button>
              <button
                type="button"
                onClick={() => setIsCameraScanner(false)}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${
                  !isCameraScanner
                    ? "bg-[var(--gp-champagne)] text-[var(--gp-espresso)] shadow-[0_0_15px_rgba(201,176,106,0.3)]"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                Text Lookup
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.055] p-4 w-full">
            {/* Scan Area */}
            {isCameraScanner ? (
              <div className="w-full max-w-md mx-auto aspect-square rounded-[24px] overflow-hidden border border-white/10 p-1 bg-black animate-[fadeIn_0.5s_ease-out]">
                <QRScanner onScan={handleScan} isScanningActive={isCameraScanner} />
              </div>
            ) : (
              <div className="flex aspect-square max-w-md mx-auto items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-[radial-gradient(circle_at_50%_50%,rgba(125,255,60,.12),transparent_28%),#050505] p-6 text-center">
                <span className="text-sm font-black uppercase tracking-[0.18em] text-white/40">
                  Search by ticket ID, phone, name, email, or token in fields below
                </span>
              </div>
            )}

            {/* Manual Text Lookup Fallback directly under camera/scan block */}
            {isCameraScanner && (
              <div className="mt-6 pt-6 border-t border-white/10 w-full">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--gp-champagne)] block mb-2">
                  Or Enter Ticket ID/Token Manually (Fallback)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrToken}
                    onChange={(event) => setQrToken(event.target.value)}
                    placeholder="Enter ticket ID, email, or token..."
                    className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm outline-none text-white focus:border-[var(--gp-champagne)]/40 focus:bg-black/70 transition-all min-w-0"
                  />
                  <button
                    type="button"
                    onClick={submitManualLookup}
                    className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/16 transition-all active:scale-[0.98] whitespace-nowrap"
                  >
                    Lookup
                  </button>
                </div>
              </div>
            )}

            {/* Input fields */}
            <label className="mt-4 grid gap-2 w-full">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/48">Scanned Payload / Token</span>
              <textarea 
                value={qrToken} 
                onChange={(event) => setQrToken(event.target.value)} 
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none text-white focus:border-[var(--gp-champagne)]/40 focus:bg-black/70 transition-all" 
                placeholder={isCameraScanner ? "Scanned QR data will populate here automatically..." : "Paste signed QR token, ticket ID, name, email..."} 
                style={{ overflowWrap: "anywhere" }}
              />
            </label>

            <div className="mt-4 grid gap-3 md:grid-cols-2 w-full">
              <button 
                type="button" 
                onClick={submitScan} 
                className="rounded-2xl bg-emerald-400 px-4 py-3 font-black text-black hover:bg-emerald-300 transition-all active:scale-[0.98]"
              >
                Validate QR
              </button>
              <button 
                type="button" 
                onClick={submitManualLookup} 
                className="rounded-2xl bg-white/10 px-4 py-3 font-bold hover:bg-white/16 transition-all active:scale-[0.98]"
              >
                Manual Lookup
              </button>
            </div>

            {message ? (
              <p className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white/70 transition-all border border-white/5 animate-pulse" style={{ overflowWrap: "anywhere" }}>
                {message}
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 w-full overflow-hidden">
          <ScannerResult 
            state={(scanResult?.status as never) || (manual ? "ALREADY USED" : "VALID")} 
            ticketId={scanResult?.ticketId}
            attendeeName={scanResult?.attendeeName}
            category={scanResult?.category}
            payment={scanResult?.payment}
            checkedInTime={scanResult?.checkedInAt}
            gateName={scanResult?.gateName}
          />
          {scanResult ? (
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm backdrop-blur-md" style={{ overflowWrap: "anywhere" }}>
              <p className="font-bold text-emerald-300" style={{ overflowWrap: "anywhere" }}>{scanResult.message}</p>
              {scanResult.ticketId && <p className="mt-2 text-white/54" style={{ overflowWrap: "anywhere" }}>Ticket ID: {scanResult.ticketId}</p>}
              {scanResult.checkedInAt && <p className="text-white/54">Time: {new Date(scanResult.checkedInAt).toLocaleString()}</p>}
              {scanResult.gateName && <p className="text-white/54">Gate: {scanResult.gateName}</p>}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 w-full">
            {["Allow Entry", "Deny Entry", "Manual Lookup", "Report Issue"].map((button) => (
              <button key={button} type="button" onClick={() => markDecision(`${button} recorded for this scanner session.`)} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-bold hover:bg-white/14 transition-all active:scale-[0.98]">{button}</button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
