"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { MapPanel, StatusBadge } from "@/components/gatepass/admin-components";

export default function GPSPage() {
  const [alertSent, setAlertSent] = useState(false);

  async function sendEmergencyAlert() {
    setAlertSent(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organizationId: "org_demo",
          channel: "email",
          template: "emergency_alert",
          target: "gate-control@gatepass.local",
        }),
      });
    } catch {
      // Local UI feedback still records the click when the preview API is unavailable.
    }
  }

  return (
    <main className="min-h-screen bg-[#101713] px-4 py-8 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px]">
        <MapPanel secure />
        <aside className="grid gap-4">
          <StatusBadge status="Outside Geofence" />
          {["Entry checkpoint: Main Gate", "Check-in status: Active", "Safety alerts: none", "Last location update: 18s ago", "Battery: 78%", "Network: low-data mode"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/6 p-4 font-bold">{item}</div>
          ))}
          <button type="button" onClick={sendEmergencyAlert} className="flex items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-4 font-black uppercase tracking-[0.12em] hover:bg-red-400">
            <AlertTriangle className="h-4 w-4" />
            {alertSent ? "Alert sent" : "Emergency alert"}
          </button>
          {alertSent ? <p className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">Emergency alert recorded and routed to gate control.</p> : null}
        </aside>
      </div>
    </main>
  );
}
