"use client";

import { useEffect, useState } from "react";

type WalletPreference = "apple" | "google" | "ask" | "none";
type WalletPrepareResponse = {
  ticketId: string;
  apple: { available: boolean; url: string; status: string; missing?: string[]; walletPassId?: string };
  google: { available: boolean; url: string; status: string; missing?: string[]; walletPassId?: string };
};

function preferredProvider() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|macintosh/.test(ua) && /safari/.test(ua)) return "apple";
  if (/android/.test(ua)) return "google";
  return "unknown";
}

export function WalletPreferenceStep({
  onSaved,
}: {
  onSaved?: (preference: WalletPreference) => void;
}) {
  const [saving, setSaving] = useState<WalletPreference | null>(null);

  async function save(preference: WalletPreference) {
    setSaving(preference);
    await fetch("/api/user/wallet-preference", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet_preference: preference }),
    });
    setSaving(null);
    onSaved?.(preference);
  }

  return (
    <div className="rounded-3xl border border-[#0a7f8f]/14 bg-white p-4 shadow-[0_18px_52px_rgba(10,127,143,.08)]">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--gp-brand-primary)]">
        Save tickets to Wallet after booking?
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[
          ["apple", "Apple Wallet"],
          ["google", "Google Wallet"],
          ["ask", "Ask every time"],
          ["none", "Website/email only"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => save(value as WalletPreference)}
            disabled={saving !== null}
            className="rounded-2xl border border-[#0a7f8f]/14 px-4 py-3 text-left text-sm font-bold text-[var(--ink)] transition hover:border-[#0a7f8f]/36 hover:bg-[#0a7f8f]/6"
          >
            {saving === value ? "Saving..." : label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WalletSmartRedirect({
  ticketId,
  autoOpen = true,
}: {
  ticketId: string;
  autoOpen?: boolean;
}) {
  const [preference, setPreference] = useState<WalletPreference>("ask");
  const [prepared, setPrepared] = useState<WalletPrepareResponse | null>(null);
  const [message, setMessage] = useState("Preparing wallet links...");
  const [error, setError] = useState("");
  const [platform] = useState(preferredProvider);

  useEffect(() => {
    let cancelled = false;
    async function prepare() {
      setError("");
      const [prefResponse, walletResponse] = await Promise.all([
        fetch("/api/user/wallet-preference").then((response) => response.json()),
        fetch(`/api/wallet/prepare/${ticketId}`, {
          method: "POST",
        }).then((response) => response.json()),
      ]);
      if (cancelled) return;
      const savedPreference = (prefResponse.walletPreference ?? prefResponse.wallet_preference ?? "ask") as WalletPreference;
      setPreference(savedPreference);
      setPrepared(walletResponse);
      const anyProviderReady = Boolean(walletResponse.apple?.available || walletResponse.google?.available);
      setMessage(
        anyProviderReady
          ? "Wallet save links are ready. Confirm inside Apple Wallet or Google Wallet to save this ticket."
          : "Wallet providers are not configured yet. Your QR pass and confirmation email still work.",
      );

      const provider = savedPreference === "apple" || savedPreference === "google" ? savedPreference : platform;
      if (autoOpen && (savedPreference === "apple" || savedPreference === "google")) {
        const target = provider === "apple" ? walletResponse.apple : walletResponse.google;
        if (target?.available && target.url) {
          setMessage(`Opening ${provider === "apple" ? "Apple Wallet" : "Google Wallet"} save flow. Confirm inside the wallet app.`);
          window.setTimeout(() => window.open(target.url, "_blank", "noopener,noreferrer"), 700);
        } else {
          setMessage(`${provider === "apple" ? "Apple Wallet" : "Google Wallet"} is not configured yet. Use the QR pass for entry.`);
        }
      }
    }
    prepare().catch((reason) => {
      setMessage("Wallet setup could not be loaded. Your QR pass and email still work.");
      setError(reason instanceof Error ? reason.message : "Wallet setup request failed");
    });
    return () => {
      cancelled = true;
    };
  }, [autoOpen, platform, ticketId]);

  const showPreference = preference === "ask";

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-[#0a7f8f]/14 bg-white p-4 text-sm font-semibold text-[var(--ink)]/70">
        {message}
        {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
      </div>
      {showPreference ? (
        <WalletPreferenceStep onSaved={(next) => setPreference(next)} />
      ) : null}
      <WalletButtons prepared={prepared} />
    </div>
  );
}

export function WalletButtons({ prepared }: { prepared: WalletPrepareResponse | null }) {
  const appleReady = Boolean(prepared?.apple?.available && prepared.apple.url);
  const googleReady = Boolean(prepared?.google?.available && prepared.google.url);
  const appleUrl = prepared?.apple?.url ?? "";
  const googleUrl = prepared?.google?.url ?? "";
  const appleUnavailable = prepared?.apple && !prepared.apple.available;
  const googleUnavailable = prepared?.google && !prepared.google.available;
  const missingApple = prepared?.apple?.missing ?? [];
  const missingGoogle = prepared?.google?.missing ?? [];

  function unavailableText(provider: "Apple Wallet" | "Google Wallet", missing: string[]) {
    if (!prepared) return `${provider} setup is loading.`;
    if (missing.length === 0) return `${provider} is temporarily unavailable.`;
    return `${provider} needs production setup: ${missing.join(", ")}`;
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {appleReady ? (
          <a
            href={appleUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-black/86"
          >
            Add to Apple Wallet
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-2xl border border-[#d6e9eb] bg-[#f3f7f8] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[var(--ink)]/38"
          >
            Apple Wallet unavailable
          </button>
        )}

        {googleReady ? (
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-[var(--gp-brand-primary)] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#086b78]"
          >
            Add to Google Wallet
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-2xl border border-[#d6e9eb] bg-[#f3f7f8] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[var(--ink)]/38"
          >
            Google Wallet unavailable
          </button>
        )}
      </div>
      {appleUnavailable ? (
        <p className="rounded-2xl border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {unavailableText("Apple Wallet", missingApple)}
        </p>
      ) : null}
      {googleUnavailable ? (
        <p className="rounded-2xl border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {unavailableText("Google Wallet", missingGoogle)}
        </p>
      ) : null}
      {!appleReady && !googleReady ? (
        <p className="text-xs font-semibold text-[var(--ink)]/58">
          Entry is still valid with the GatePass QR shown on this pass page.
        </p>
      ) : null}
    </div>
  );
}
