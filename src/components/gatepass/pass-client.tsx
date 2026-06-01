"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StatusBadge } from "@/components/gatepass/admin-components";
import { WalletSmartRedirect } from "@/components/gatepass/wallet-actions";

export function PassClient({
  ticketId,
  token,
  eventTitle,
  attendeeName,
  status,
}: {
  ticketId: string;
  token: string;
  eventTitle: string;
  attendeeName: string;
  status: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/tickets/${ticketId}/qr?token=${encodeURIComponent(token)}`)
      .then((response) => response.json())
      .then((payload) => setQrDataUrl(payload.qrDataUrl));
  }, [ticketId, token]);

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
            Open this pass from the booking confirmation link to render QR.
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Ticket ID", ticketId],
          ["Attendee", attendeeName],
          ["QR", token ? "Signed token" : "Token required"],
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
        <WalletSmartRedirect ticketId={ticketId} qrToken={token} autoOpen={false} />
      </div>
    </div>
  );
}
