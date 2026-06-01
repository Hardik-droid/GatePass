import { createId } from "../core/ids";
import { getStore } from "../core/store";
import { queueNotification } from "./notifications";
import { createSecureQrToken, hashQrToken } from "./qr-service";
import { prepareWalletPasses } from "./wallet-service";

type OrderItem = {
  ticketCategoryId?: string;
  quantity?: number;
};

type OrderRecord = Record<string, unknown> & {
  id: string;
  status?: string;
  eventId?: string;
  organizationId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  items?: OrderItem[];
};

export function listOrders() {
  return getStore().orders;
}

export function getOrder(id: string) {
  return getStore().orders.find((order) => order.id === id) as OrderRecord | undefined;
}

export function createOrder(payload: Record<string, unknown>) {
  const order = { id: createId("ord"), status: "created", ...payload };
  getStore().orders.push(order);
  return { order };
}

export function handleManualOrder(orderId: string) {
  const store = getStore();
  const order = getOrder(orderId) ?? { id: orderId, eventId: store.events[0]?.id, organizationId: store.organizations[0]?.id };
  order.status = "paid";
  const items = Array.isArray(order.items) ? order.items : [{ ticketCategoryId: store.ticketCategories[0]?.id, quantity: 1 }];
  const rawTokens: string[] = [];
  const tickets = items.flatMap((item) =>
    Array.from({ length: Number(item.quantity ?? 1) }, () => {
      const id = createId("tck").toUpperCase();
      const qrToken = createSecureQrToken(id, String(order.eventId ?? store.events[0]?.id));
      rawTokens.push(qrToken);
      const ticket = {
        id,
        organizationId: String(order.organizationId ?? store.organizations[0]?.id),
        eventId: String(order.eventId ?? store.events[0]?.id),
        ticketCategoryId: String(item.ticketCategoryId ?? store.ticketCategories[0]?.id),
        attendeeName: String(order.buyerName ?? "Guest"),
        attendeeEmail: String(order.buyerEmail ?? "dev@gatepass.local"),
        attendeePhone: String(order.buyerPhone ?? "+919000000000"),
        status: "issued",
        checkedInAt: "",
        checkedInGateId: "",
        checkedInBy: "",
        qrToken: "",
        qrTokenHash: hashQrToken(qrToken),
        walletEnabled: true,
        appleWalletPassId: "",
        googleWalletPassId: "",
        walletLastUpdatedAt: "",
      };
      store.tickets.push(ticket);
      const wallet = prepareWalletPasses(id, { rawToken: qrToken });
      queueNotification({
        template: "ticket_confirmation",
        subject: `Your GatePass ticket for ${store.events.find((event) => event.id === ticket.eventId)?.title ?? "your event"}`,
        recipientEmail: ticket.attendeeEmail,
        relatedTicketId: id,
        status: process.env.RESEND_API_KEY ? "sent" : "dev_previewed",
        provider: process.env.RESEND_API_KEY ? "resend" : "dev",
        walletLinks: wallet,
        emailPreviewHtml: `<p>Save this ticket to your phone wallet and scan it at the gate without reopening the website.</p><p><a href="${wallet.apple.url}">Add to Apple Wallet</a> <a href="${wallet.google.url}">Add to Google Wallet</a></p>`,
      });
      return ticket;
    }),
  );
  return { order, tickets, rawTokens };
}

export function markOrderPaid(id: string) {
  const order = getOrder(id);
  if (order) order.status = "paid";
  return order;
}

export function markOrderFailed(id: string) {
  const order = getOrder(id);
  if (order) order.status = "failed";
  return order;
}
