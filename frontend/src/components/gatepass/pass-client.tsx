"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StatusBadge } from "@/components/gatepass/admin-components";

export function GoogleWalletDirectButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddToWallet = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/wallet/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      if (!res.ok) throw new Error("Failed to generate Google Wallet link");
      const data = await res.json();
      if (data.saveUrl) {
        window.location.href = data.saveUrl;
      } else {
        throw new Error(data.error || "No saveUrl returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate Google Wallet link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      <button
        onClick={handleAddToWallet}
        disabled={loading}
        className="transition hover:opacity-90 active:opacity-80 disabled:opacity-50"
        aria-label="Add to Google Wallet"
      >
        <Image
          src="https://wallet.google/images/branding/en/add_to_google_wallet/black-badge.svg" 
          alt="Add to Google Wallet" 
          width={180}
          height={48}
          className="h-[48px] w-auto"
          unoptimized
        />
      </button>
      {loading && <p className="mt-2 text-center text-xs font-medium text-gray-500">Preparing Wallet Link...</p>}
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}


export function PassClient({
  ticketId,
  eventTitle,
  attendeeName,
  status,
}: {
  ticketId: string;
  eventTitle: string;
  attendeeName: string;
  status: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}/qr`)
      .then((response) => response.json())
      .then((payload) => setQrDataUrl(payload.qrDataUrl));
  }, [ticketId]);

  return (
    <div className="rounded-[32px] border border-[#0a7f8f]/14 bg-white p-5 text-[var(--ink)] shadow-[0_24px_70px_rgba(10,127,143,.1)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-60">
            Secure QR pass
          </p>
          <h2 className="mt-2 font-serif text-3xl">{eventTitle}</h2>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mx-auto my-7 flex h-52 w-52 items-center justify-center rounded-[28px] bg-white">
        {qrDataUrl ? (
          <Image src={qrDataUrl} alt="GatePass QR" width={190} height={190} unoptimized />
        ) : (
          <span className="px-5 text-center text-sm font-bold opacity-60">
            Sign in with the ticket owner account to render QR.
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Ticket ID", ticketId],
          ["Attendee", attendeeName],
          ["QR", qrDataUrl ? "Ready" : "Protected"],
          ["Status", status],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-black/8 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] opacity-50">
              {label}
            </p>
            <p className="mt-1 break-words font-bold">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold opacity-62">
        QR uses a secure signed token. Personal data is not encoded.
      </p>
      <div className="mt-5">
        <GoogleWalletDirectButton ticketId={ticketId} />
      </div>

    </div>
  );
}
