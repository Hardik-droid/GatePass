import { MatrixPage } from "@/components/gatepass/admin-pages";

export default function ArchitecturePage() {
  return <MatrixPage title="Architecture" items={["Organization", "User", "OrganizationMember", "Event", "TicketCategory", "Order", "Ticket", "ScanLog", "Payment", "Settlement", "AuditEvent", "event-service", "ticket-service", "order-service", "payment-service", "scanner-service", "reporting-service", "audit-service", "notification-service", "OrderCreated -> PaymentConfirmed -> TicketIssued", "TicketScanned -> ScanValidated -> EntryGranted / EntryDenied", "QR stores signed token or opaque token only", "Never encode phone, raw user info, or payment info"]} />;
}
