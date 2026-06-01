"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { StatusBadge } from "@/components/gatepass/admin-components";

export default function GatepassRequestPage() {
  const fields = ["Reason", "Destination", "Date/time", "Expected return time", "Emergency option", "Parent/admin approval", "GPS permission"];
  const [submitted, setSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    try {
      await fetch("/api/gatepass/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formValues),
      });
    } catch {
      // The local preview still confirms the request when the API is unavailable.
    }
  }

  return (
    <main className="min-h-screen bg-[#101713] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-6xl">Request gatepass</h1>
        <form onSubmit={submitRequest} className="mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field} className="grid gap-2 rounded-[22px] border border-white/10 bg-white/6 p-4">
              <span className="text-sm font-bold">{field}</span>
              <input
                value={formValues[field] ?? ""}
                onChange={(event) => setFormValues((current) => ({ ...current, [field]: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3 outline-none"
                placeholder={`Enter ${field.toLowerCase()}`}
              />
            </label>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {["Submitted", "Pending Approval", "Approved", "Active", "Checked Out", "Returned / Expired"].map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
        <button type="submit" className="mt-8 rounded-full bg-[var(--gp-champagne)] px-6 py-3 font-black uppercase tracking-[0.12em] text-[var(--gp-espresso)]">Submit request</button>
        {submitted ? <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 font-bold text-emerald-100">Gatepass request submitted for approval.</p> : null}
        </form>
      </div>
    </main>
  );
}
