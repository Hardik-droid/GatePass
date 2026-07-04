"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { isDevAuthEnabled } from "@/utils/supabase/env";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/app";
  const errorFromCallback = searchParams.get("error");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(errorFromCallback || "");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode, name, email, password, redirectTo }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.message || "Authentication failed");
      return;
    }
    if (data.needsConfirmation) {
      setMessage(data.message || "Check your email to confirm your account.");
      return;
    }
    window.location.href = data.redirectTo || "/app";
  }

  async function devLogin() {
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/auth/dev?redirect=${encodeURIComponent(redirectTo)}&role=owner`, {
      method: "POST",
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.message || "Dev login failed");
      return;
    }
    window.location.href = data.redirectTo || "/app";
  }

  const title = mode === "login" ? "Login to GatePass" : "Create your GatePass account";
  const subtitle =
    mode === "login"
      ? "Open your QR passes, gatepass requests, and wallet tickets."
      : "Create an attendee account for tickets, QR passes, and hostel gatepass requests.";

  return (
    <main className="min-h-screen bg-[#f7fbfb] px-4 py-8 text-[var(--ink)]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section>
          <Link href="/" className="font-serif text-3xl uppercase tracking-[0.12em] text-[var(--gp-brand-primary)]">
            GatePass
          </Link>
          <p className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-[var(--gp-brand-primary)]">
            Secure event access
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">
            Tickets, QR entry, and gatepass control in one account.
          </h1>
          <p className="mt-5 max-w-xl text-lg font-semibold text-[var(--ink)]/62">
            Use email authentication with Neon Auth. In local dev, the bypass button creates a signed owner session when enabled.
          </p>
        </section>

        <section className="rounded-[32px] border border-[#0a7f8f]/14 bg-white p-6 shadow-[0_24px_80px_rgba(10,127,143,.12)]">
          <h2 className="font-serif text-3xl">{title}</h2>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]/58">{subtitle}</p>

          <div className="mt-6 grid gap-3">
            <a
              href={`/api/auth/oauth/google?redirect=${encodeURIComponent(redirectTo)}`}
              className="rounded-2xl border border-[#0a7f8f]/14 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] transition hover:border-[#0a7f8f]/35 hover:bg-[#0a7f8f]/5"
            >
              Continue with Google
            </a>
            <a
              href={`/api/auth/oauth/apple?redirect=${encodeURIComponent(redirectTo)}`}
              className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-black/85"
            >
              Continue with Apple
            </a>
            {isDevAuthEnabled() ? (
              <button
                type="button"
                onClick={devLogin}
                disabled={loading}
                className="rounded-2xl border border-dashed border-[#0a7f8f]/28 bg-[#0a7f8f]/6 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[#086b78] transition hover:border-[#0a7f8f]/48 hover:bg-[#0a7f8f]/10 disabled:opacity-50"
              >
                {loading ? "Please wait..." : "Continue as Dev Owner"}
              </button>
            ) : null}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--ink)]/38">
            <span className="h-px flex-1 bg-[#0a7f8f]/12" />
            Email
            <span className="h-px flex-1 bg-[#0a7f8f]/12" />
          </div>

          <form onSubmit={submit} className="grid gap-3">
            {mode === "signup" ? (
              <label className="grid gap-2 text-sm font-bold">
                Name
                <input
                  value={name}
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 rounded-2xl border border-[#0a7f8f]/14 px-4 outline-none focus:border-[#0a7f8f]/48"
                  placeholder="Your name"
                />
              </label>
            ) : null}
            <label className="grid gap-2 text-sm font-bold">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-2xl border border-[#0a7f8f]/14 px-4 outline-none focus:border-[#0a7f8f]/48"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-2xl border border-[#0a7f8f]/14 px-4 outline-none focus:border-[#0a7f8f]/48"
                placeholder="Minimum 6 characters"
              />
            </label>
            {message ? (
              <p className="rounded-2xl border border-amber-300/40 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-2xl bg-[var(--gp-brand-primary)] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#086b78] disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-semibold text-[var(--ink)]/58">
            {mode === "login" ? "New to GatePass?" : "Already have an account?"}{" "}
            <Link
              href={`${mode === "login" ? "/signup" : "/login"}?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-black text-[var(--gp-brand-primary)]"
            >
              {mode === "login" ? "Create account" : "Login"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
