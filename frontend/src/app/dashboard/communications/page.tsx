import { AppShell, StatusBadge } from "@/components/gatepass/admin-components";
import { listNotifications } from "@/backend/modules/notifications";

export const dynamic = "force-dynamic";

export default function CommunicationsPage() {
  const notifications = listNotifications();

  return (
    <AppShell title="Communications">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-white/6 text-xs uppercase tracking-[0.14em] text-white/46">
              <tr>
                {["Recipient", "Subject", "Email Status", "Provider", "Apple Wallet", "Google Wallet", "Attempts", "Ticket", "Sent at"].map((head) => (
                  <th key={head} className="px-4 py-4">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => {
                const walletLinks = notification.walletLinks as
                  | { apple?: { available?: boolean }; google?: { available?: boolean } }
                  | undefined;
                return (
                <tr key={notification.id} className="border-t border-white/8">
                  <td className="px-4 py-4">{notification.recipientEmail ?? notification.target}</td>
                  <td className="px-4 py-4 font-bold">{notification.subject}</td>
                  <td className="px-4 py-4"><StatusBadge status={notification.status} /></td>
                  <td className="px-4 py-4">{notification.provider}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={walletLinks?.apple?.available ? "link generated" : "unavailable"} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={walletLinks?.google?.available ? "link generated" : "unavailable"} />
                  </td>
                  <td className="px-4 py-4">{notification.attempts ?? 0}</td>
                  <td className="px-4 py-4">{notification.relatedTicketId}</td>
                  <td className="px-4 py-4">{notification.sentAt ?? "-"}</td>
                </tr>
              );})}
              {notifications.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-white/54" colSpan={9}>
                    Ticket confirmations will appear here after a booking is issued.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
