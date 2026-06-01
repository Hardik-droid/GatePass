"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell, AttendanceChart, AuditTimeline, EmptyState, MapPanel, MetricsGrid, OrdersTable, RevenueChart, ScannerResult, StatusBadge, TicketLifecycle } from "@/components/gatepass/admin-components";
import { auditEvents, ticketCategories } from "@/lib/mock-data";

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
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field} className="grid gap-2 rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
              <span className="text-sm font-bold">{field}</span>
              <input className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3 outline-none" placeholder={field} />
            </label>
          ))}
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-white/52">Event types</p>
          <div className="mt-4 grid gap-2">
            {types.map((type) => (
              <StatusBadge key={type} status={type} />
            ))}
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
  async function submitScan() {
    setMessage("");
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
        qrToken,
      }),
    });
    const payload = await response.json();
    setScanResult(payload);
  }
  async function submitManualLookup() {
    if (!qrToken.trim()) {
      setMessage("Enter a ticket, phone, name, order, or token to search.");
      return;
    }
    const response = await fetch("/api/scanner/manual-lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: qrToken }),
    });
    const payload = await response.json();
    setScanResult({
      status: payload.items?.length ? "VALID" : "INVALID",
      message: payload.items?.length ? `Found ${payload.items.length} matching ticket(s).` : "No matching ticket found.",
      ticketId: payload.items?.[0]?.id ?? "",
      gateName: "Manual lookup",
    });
  }
  function markDecision(decision: string) {
    setMessage(decision);
  }
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gp-champagne)]">Mobile web scanner</p>
          <h1 className="mt-3 font-serif text-6xl">{manual ? "Manual Lookup" : "Scanner"}</h1>
          <div className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.055] p-4">
            <div className="flex aspect-square items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-[radial-gradient(circle_at_50%_50%,rgba(125,255,60,.18),transparent_28%),#050505]">
              <span className="text-sm font-black uppercase tracking-[0.18em] text-white/50">{manual ? "Search by ticket, phone, name, order, token" : "Camera scanner area"}</span>
            </div>
            <label className="mt-4 grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/48">QR token</span>
              <textarea value={qrToken} onChange={(event) => setQrToken(event.target.value)} className="min-h-24 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none" placeholder="Paste signed QR token from the pass link" />
            </label>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button type="button" onClick={submitScan} className="rounded-2xl bg-emerald-400 px-4 py-3 font-black text-black">Validate QR</button>
              <button type="button" onClick={submitManualLookup} className="rounded-2xl bg-white/10 px-4 py-3 font-bold hover:bg-white/16">Manual Lookup</button>
            </div>
            {message ? <p className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white/74">{message}</p> : null}
          </div>
        </section>
        <section className="grid gap-4">
          <ScannerResult state={(scanResult?.status as never) || (manual ? "ALREADY USED" : "VALID")} />
          {scanResult ? (
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm">
              <p className="font-bold">{scanResult.message}</p>
              <p className="mt-2 text-white/54">Ticket: {scanResult.ticketId ?? "unknown"}</p>
              <p className="text-white/54">Checked in: {scanResult.checkedInAt ?? scanResult.scannedAt}</p>
              <p className="text-white/54">Gate: {scanResult.gateName ?? "Main Gate"}</p>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            {["Allow Entry", "Deny Entry", "Manual Lookup", "Report Issue"].map((button) => (
              <button key={button} type="button" onClick={() => markDecision(`${button} recorded for this scanner session.`)} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-bold hover:bg-white/14">{button}</button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
