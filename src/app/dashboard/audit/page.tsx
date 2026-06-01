import { AppShell, StatusBadge } from "@/components/gatepass/admin-components";
import { listAuditEvents } from "@/backend/modules/audit";

export const dynamic = "force-dynamic";

export default function AuditDashboardPage() {
  const auditEvents = listAuditEvents();

  return (
    <AppShell title="Audit Logs">
      <div className="grid gap-4">
        {auditEvents.map((event) => (
          <div key={event.id} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-bold">{event.action}</p>
              <StatusBadge status={event.actorRole} />
            </div>
            <p className="mt-2 text-sm text-white/58">
              {event.entityType} {event.entityId} / actor {event.actorUserId}
            </p>
            <p className="mt-2 text-xs text-white/42">{event.createdAt}</p>
          </div>
        ))}
        {auditEvents.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/15 p-6 text-white/58">
            Audit entries appear here when events, orders, payments, tickets, scans, emails, team roles, or GPS alerts are processed.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
