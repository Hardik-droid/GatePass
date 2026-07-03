import { createId } from "../core/ids";
import { HttpError } from "../core/http";
import { getStore, persistStoreRecord, persistStoreUpdate } from "../core/store";
import { queueNotification } from "./notifications";
import { createSecureQrToken, hashQrToken } from "./qr-service";
import { serializeTicket } from "./tickets";
import { prepareWalletPasses } from "./wallet-service";
import { isDevAuthEnabled } from "@/utils/supabase/env";

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
  const store = getStore();
  const items = Array.isArray(payload.items) ? payload.items as OrderItem[] : [];
  const subtotalPaisa = items.reduce((sum, item) => {
    const category = store.ticketCategories.find((entry) => entry.id === item.ticketCategoryId);
    if (!category) throw new HttpError(422, `Unknown ticket category: ${item.ticketCategoryId ?? ""}`);
    return sum + Number(category.pricePaisa ?? 0) * Number(item.quantity ?? 1);
  }, 0);
  const platformFeePaisa = items.reduce((sum, item) => sum + Number(item.quantity ?? 1) * 4012, 0);
  const totalPaisa = subtotalPaisa + platformFeePaisa;
  const order = {
    id: createId("ord"),
    status: "pending_payment",
    paymentStatus: "unpaid",
    subtotalPaisa,
    platformFeePaisa,
    totalPaisa,
    currency: "INR",
    ...payload,
    items,
  };
  getStore().orders.push(order);
  void persistStoreRecord("orders", order).catch((error) => console.error("Order persistence failed", error));
  return { order };
}

function issueTickets(order: OrderRecord) {
  const store = getStore();
  if (store.tickets.some((ticket) => ticket.orderId === order.id)) {
    return store.tickets.filter((ticket) => ticket.orderId === order.id);
  }
  const items = Array.isArray(order.items) ? order.items : [{ ticketCategoryId: store.ticketCategories[0]?.id, quantity: 1 }];
  return items.flatMap((item) =>
    Array.from({ length: Number(item.quantity ?? 1) }, () => {
      const id = createId("tck").toUpperCase();
      const qrToken = createSecureQrToken(id, String(order.eventId ?? store.events[0]?.id));
      const ticket = {
        id,
        ticketId: id,
        orderId: order.id,
        userId: String(order.buyerUserId ?? order.buyerEmail ?? order.buyerName ?? ""),
        organizationId: String(order.organizationId ?? store.organizations[0]?.id),
        eventId: String(order.eventId ?? store.events[0]?.id),
        ticketCategoryId: String(item.ticketCategoryId ?? store.ticketCategories[0]?.id),
        attendeeName: String(order.buyerName ?? "Guest"),
        attendeeEmail: String(order.buyerEmail ?? "dev@gatepass.local"),
        attendeePhone: String(order.buyerPhone ?? "+919000000000"),
        status: "active",
        checkedInAt: "",
        checkedInGateId: "",
        checkedInBy: "",
        qrToken,
        qrTokenHash: hashQrToken(qrToken),
        walletEnabled: true,
        appleWalletPassId: "",
        googleWalletPassId: "",
        walletLastUpdatedAt: "",
        scannedAt: "",
        scannedBy: "",
      };
      store.tickets.push(ticket);
      const wallet = prepareWalletPasses(id);
      void persistStoreRecord("tickets", ticket).catch((error) => console.error("Ticket persistence failed", error));
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
}

export function issueTicketsForPaidOrder(orderId: string) {
  const order = getOrder(orderId);
  if (!order) throw new HttpError(404, "Order not found");
  if (order.paymentStatus !== "paid" && order.status !== "paid") {
    throw new HttpError(409, "Order is not paid");
  }
  const tickets = issueTickets(order);
  return { order, tickets: tickets.map((ticket) => serializeTicket(ticket)) };
}

export function handleManualOrder(orderId: string) {
  if (process.env.NODE_ENV === "production" || (!isDevAuthEnabled() && process.env.NEXT_PUBLIC_ENABLE_DEV_PAYMENT_SIMULATOR !== "true")) {
    throw new HttpError(403, "Manual payment confirmation is disabled");
  }
  const store = getStore();
  const order = (getOrder(orderId) ?? {
    id: orderId,
    eventId: String(store.events[0]?.id ?? ""),
    organizationId: String(store.organizations[0]?.id ?? ""),
    status: "pending_payment",
    paymentStatus: "unpaid",
    items: [],
  }) as OrderRecord;
  if (!getOrder(orderId)) store.orders.push(order);
  order.status = "paid";
  order.paymentStatus = "paid";
  void persistStoreRecord("orders", order).catch((error) => console.error("Manual order persistence failed", error));
  return issueTicketsForPaidOrder(order.id);
}

export function markOrderPaid(id: string) {
  const order = getOrder(id);
  if (order) {
    order.status = "paid";
    order.paymentStatus = "paid";
    void persistStoreUpdate("orders", order).catch((error) => console.error("Order paid persistence failed", error));
  }
  return order;
}

export function markOrderFailed(id: string) {
  const order = getOrder(id);
  if (order) {
    order.status = "failed";
    void persistStoreUpdate("orders", order).catch((error) => console.error("Order failed persistence failed", error));
  }
  return order;
}
