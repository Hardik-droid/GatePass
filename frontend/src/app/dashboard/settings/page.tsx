import { MatrixPage } from "@/components/gatepass/admin-pages";

export default function SettingsPage() {
  return <MatrixPage title="Settings" items={["Organization profile", "Branding", "Payout details", "Tax/GST fields", "Support/contact settings", "Ticket rules", "Refund rules", "QR security settings", "Geofence settings", "Notification settings", "Event visibility", "Data privacy settings"]} />;
}
