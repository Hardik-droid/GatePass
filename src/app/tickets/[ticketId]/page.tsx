import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;

  return (
    <main className="min-h-screen bg-bg-paper px-4 py-10 text-ink md:px-8">
      <div className="mx-auto max-w-4xl">
        <Badge tone="lime">QR pass surface</Badge>
        <h1 className="poster-text mt-4 text-5xl uppercase md:text-7xl">Ticket {ticketId}</h1>
        <SurfaceCard className="mt-10 border-black/8 bg-white p-8 text-ink shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <p className="text-sm uppercase tracking-[0.16em] text-black/44">Security model</p>
          <p className="mt-4 text-lg leading-8 text-black/68">
            This route is reserved for the signed or opaque QR token experience described in the spec. It is intentionally scaffolded as a dedicated surface, separate from checkout and scanner validation.
          </p>
        </SurfaceCard>
      </div>
    </main>
  );
}
