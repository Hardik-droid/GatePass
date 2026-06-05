"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Circle, QrCode, Search, ShieldAlert } from "lucide-react";
import { auditEvents, dashboardNav, metrics, revenueData, ticketRows } from "@/lib/mock-data";
import type { Metric, ScanResultState, TicketStatus } from "@/types/gatepass";

export function StatusBadge({ status }: { status: TicketStatus | ScanResultState | string }) {
  const tone = String(status).includes("VALID") || String(status).includes("Approved") || String(status).includes("Checked")
    ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/20"
    : String(status).includes("USED") || String(status).includes("Pending") || String(status).includes("Outside")
      ? "bg-amber-400/15 text-amber-200 border-amber-300/20"
      : String(status).includes("INVALID") || String(status).includes("REFUNDED") || String(status).includes("Rejected")
        ? "bg-red-400/15 text-red-200 border-red-300/20"
        : "bg-white/10 text-white/72 border-white/12";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${tone}`}>{status}</span>;
}

export function AppShell({ children, title = "Control Room" }: { children: React.ReactNode; title?: string }) {
  return (
    <main className="min-h-screen bg-[#080908] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#10110f] p-5 xl:block">
        <Link href="/" className="font-serif text-3xl uppercase tracking-[0.12em] text-[var(--gp-champagne)]">
          GatePass
        </Link>
        <nav className="mt-8 grid gap-1">
          {dashboardNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white/68 hover:bg-white/7 hover:text-white">
              {Icon ? <Icon className="h-4 w-4 text-[var(--gp-champagne)]" /> : null}
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080908]/85 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gp-champagne)]">Organizer workspace</p>
              <h1 className="font-serif text-3xl md:text-5xl">{title}</h1>
            </div>
            <label className="relative hidden w-80 md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/36" />
              <span className="sr-only">Search admin</span>
              <input className="h-11 w-full rounded-full border border-white/10 bg-white/6 pl-11 pr-4 text-sm outline-none" placeholder="Search tickets, gates, staff" />
            </label>
          </div>
        </header>
        <div className="px-4 py-8 md:px-8">{children}</div>
      </section>
    </main>
  );
}

export function StatCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
      <p className="text-sm text-white/54">{metric.label}</p>
      <p className="mt-3 font-serif text-4xl">{metric.value}</p>
      {metric.delta ? <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gp-champagne)]">{metric.delta}</p> : null}
    </div>
  );
}

export function MetricsGrid({ limit = 12 }: { limit?: number }) {
  const [liveMetrics, setLiveMetrics] = useState<Metric[] | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/dashboard", { headers: { "x-gatepass-role": "OWNER" } })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setLiveMetrics([
          { label: "Total events", value: String(data.totalEvents ?? 0) },
          { label: "Active events", value: String(data.activeEvents ?? 0) },
          { label: "Tickets sold", value: String(data.soldTickets ?? 0) },
          { label: "Checked in", value: String(data.checkedInTickets ?? 0) },
          { label: "Unused", value: String(data.unusedTickets ?? 0) },
          { label: "Manual tickets", value: String(data.manualTickets ?? 0) },
          { label: "Gross sales", value: `Rs ${Math.round((data.revenuePaisa ?? 0) / 100).toLocaleString("en-IN")}` },
          { label: "Invalid scans", value: String(data.invalidScans ?? 0) },
          { label: "Duplicate scans", value: String(data.duplicateScans ?? 0) },
          { label: "GPS alerts", value: String(data.gpsAlerts ?? 0) },
        ]);
      })
      .catch(() => setLiveMetrics(null));
    return () => {
      active = false;
    };
  }, []);
  const source = liveMetrics ?? metrics;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {source.slice(0, limit).map((metric) => (
        <StatCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

export function RevenueChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="h-80 rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
      <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/52">Revenue trend</p>
      {mounted ? (
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#c9b06a" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#c9b06a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(255,255,255,.45)" />
            <YAxis stroke="rgba(255,255,255,.45)" />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,.16)", borderRadius: 16 }} />
            <Area type="monotone" dataKey="sales" stroke="#c9b06a" fill="url(#revenue)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[88%] rounded-2xl bg-black/20" />
      )}
    </div>
  );
}

export function AttendanceChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="h-80 rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
      <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/52">Attendance by day</p>
      {mounted ? (
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={revenueData}>
            <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(255,255,255,.45)" />
            <YAxis stroke="rgba(255,255,255,.45)" />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,.16)", borderRadius: 16 }} />
            <Bar dataKey="checkins" fill="#6ee7b7" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[88%] rounded-2xl bg-black/20" />
      )}
    </div>
  );
}

export function AuditTimeline() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
      <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-white/52">Recent audit feed</p>
      <div className="grid gap-4">
        {auditEvents.map((event) => (
          <div key={event.entityId} className="rounded-2xl bg-black/28 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{event.action}</p>
              <span className="text-xs text-white/44">{event.timestamp}</span>
            </div>
            <p className="mt-2 text-sm text-white/58">{event.actor} changed {event.entityType} {event.entityId}: {event.oldValue} to {event.newValue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QRPassCard() {
  return (
    <div className="rounded-[32px] border border-[var(--gp-champagne)]/24 bg-[linear-gradient(145deg,#fff8e6,#d9c18a)] p-5 text-[#22170e] shadow-[0_30px_90px_rgba(0,0,0,.25)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-60">Secure QR pass</p>
          <h2 className="mt-2 font-serif text-3xl">Midnight Frequency</h2>
        </div>
        <StatusBadge status="Approved" />
      </div>
      <div className="mx-auto my-7 flex h-52 w-52 items-center justify-center rounded-[28px] bg-white">
        <QrCode className="h-36 w-36" />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Pass ID", "GPS-PASS-8F42"],
          ["Ticket ID", "TCK-8F42"],
          ["Category", "VIP"],
          ["Gate allowed", "Main + VIP"],
          ["Payment", "Paid"],
          ["Validity", "31 May, 6 PM-1 AM"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-black/8 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] opacity-50">{label}</p>
            <p className="mt-1 font-bold">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold opacity-62">QR uses a secure token. Personal data is not encoded.</p>
    </div>
  );
}

export function ScannerResult({
  state = "VALID",
  ticketId,
  attendeeName,
  category,
  payment,
  checkedInTime,
  gateName
}: {
  state?: ScanResultState;
  ticketId?: string;
  attendeeName?: string;
  category?: string;
  payment?: string;
  checkedInTime?: string;
  gateName?: string;
}) {
  const displayAttendee = attendeeName || (ticketId ? `Ticket: ${ticketId}` : "Aarav Mehta");
  const displayCategory = category || "VIP";
  const displayPayment = payment || "Paid";
  const displayTime = checkedInTime 
    ? new Date(checkedInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) 
    : (state === "VALID" ? "Now" : "6:42 PM");
  const displayGate = gateName || "Main Gate / SCN-01";

  return (
    <div className="rounded-[30px] border border-white/12 bg-white/[0.06] p-5">
      <div className="flex items-center justify-between">
        <StatusBadge status={state} />
        {state === "VALID" ? <CheckCircle2 className="h-8 w-8 text-emerald-300" /> : <AlertTriangle className="h-8 w-8 text-amber-300" />}
      </div>
      <div className="mt-6 grid gap-3 text-sm">
        {[
          ["Attendee", displayAttendee],
          ["Category", displayCategory],
          ["Payment", displayPayment],
          ["Checked-in time", displayTime],
          ["Gate/device", displayGate],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 rounded-2xl bg-black/24 px-4 py-3">
            <span className="text-white/52 text-xs sm:text-sm">{label}</span>
            <strong className="text-left sm:text-right text-sm font-bold max-w-full sm:max-w-[240px] text-white" style={{ overflowWrap: "anywhere" }}>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapPanel({ secure = false }: { secure?: boolean }) {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_30%_28%,rgba(201,176,106,.22),transparent_18%),radial-gradient(circle_at_62%_54%,rgba(110,231,183,.18),transparent_16%),linear-gradient(145deg,#07120d,#18231c)] p-5">
      <div className="absolute inset-6 rounded-[50%] border border-dashed border-[var(--gp-champagne)]/36" />
      <div className="absolute left-[42%] top-[42%] h-5 w-5 rounded-full bg-emerald-300 shadow-[0_0_35px_rgba(110,231,183,.8)]" />
      <div className="absolute right-10 top-10 rounded-2xl bg-black/40 p-3 text-xs font-bold uppercase tracking-[0.12em] text-white/70">Inside geofence</div>
      <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-3">
        {[
          ["Last update", "18s ago"],
          ["Network", "Low-data ready"],
          [secure ? "Emergency" : "Checkpoint", secure ? "No flags" : "Main Gate"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-black/44 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/42">{label}</p>
            <p className="mt-1 font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TicketLifecycle() {
  const steps = ["created", "reserved", "paid", "issued", "checked_in", "expired/refunded/cancelled"];
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
      <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-white/52">Ticket lifecycle</p>
      <div className="grid gap-3 md:grid-cols-6">
        {steps.map((step, index) => (
          <div key={step} className="rounded-2xl bg-black/28 p-4">
            <Circle className={`h-4 w-4 ${index < 5 ? "fill-[var(--gp-champagne)] text-[var(--gp-champagne)]" : "text-white/30"}`} />
            <p className="mt-3 text-sm font-bold uppercase">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrdersTable() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="bg-white/6 text-xs uppercase tracking-[0.14em] text-white/46">
            <tr>
              {["Ticket ID", "Event ID", "Category", "Buyer", "QR", "Payment", "Apple Wallet", "Google Wallet", "Wallet Status", "Last Wallet Sync", "Status", "Scan", "Gate", "Refund"].map((head) => (
                <th key={head} className="px-4 py-4">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ticketRows.map((row) => (
              <tr key={row.id} className="border-t border-white/8">
                <td className="px-4 py-4 font-bold">{row.id}</td>
                <td className="px-4 py-4">{row.eventId}</td>
                <td className="px-4 py-4">{row.category}</td>
                <td className="px-4 py-4">{row.buyer}</td>
                <td className="px-4 py-4">{row.qrStatus}</td>
                <td className="px-4 py-4">{row.paymentId}</td>
                <td className="px-4 py-4">link ready</td>
                <td className="px-4 py-4">link ready</td>
                <td className="px-4 py-4">created</td>
                <td className="px-4 py-4">on demand</td>
                <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-4">{row.scanStatus}</td>
                <td className="px-4 py-4">{row.gate}</td>
                <td className="px-4 py-4">{row.refund}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({ title = "No records yet", text = "Create an event or adjust filters to see data here." }: { title?: string; text?: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/18 bg-white/[0.035] p-8 text-center">
      <ShieldAlert className="mx-auto h-9 w-9 text-[var(--gp-champagne)]" />
      <h3 className="mt-4 font-serif text-3xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-white/58">{text}</p>
    </div>
  );
}
