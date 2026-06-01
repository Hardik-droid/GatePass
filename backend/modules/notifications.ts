import { createId, nowIso } from "../core/ids";
import { getStore } from "../core/store";

export function listNotifications() {
  return getStore().notifications;
}

export function queueNotification(payload: Record<string, unknown>) {
  const notification = {
    id: createId("ntf"),
    status: "queued",
    provider: "local",
    attempts: 0,
    subject: String(payload.subject ?? payload.template ?? "GatePass notification"),
    target: String(payload.target ?? payload.recipient ?? "gate-control"),
    recipientEmail: payload.recipientEmail ? String(payload.recipientEmail) : undefined,
    relatedTicketId: String(payload.relatedTicketId ?? ""),
    sentAt: nowIso(),
    ...payload,
  };
  getStore().notifications.unshift(notification);
  return { notification };
}

export function resendTicketConfirmation(payload: Record<string, unknown> | string) {
  return queueNotification(typeof payload === "string" ? { relatedTicketId: payload, template: "ticket_confirmation", subject: "Ticket confirmation resent" } : { ...payload, template: "ticket_confirmation", subject: "Ticket confirmation resent" });
}

export const sendTicketConfirmationEmail = resendTicketConfirmation;
export const sendEventReminderEmail = queueNotification;
export const sendRefundEmail = queueNotification;
