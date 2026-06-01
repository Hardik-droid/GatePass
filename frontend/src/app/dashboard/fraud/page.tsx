import { MatrixPage } from "@/components/gatepass/admin-pages";

export default function FraudPage() {
  return <MatrixPage title="Anti-Fraud" items={["Screenshot shared with multiple people", "Refunded ticket used at gate", "Fake QR generated", "Same QR scanned twice", "Staff manually allows unpaid entry", "Offline ticket not recorded", "Manual count manipulation", "Signed QR tokens", "Duplicate scan blocking", "Role-based scanner access", "Refund invalidates ticket", "Gate-wise staff logs"]} />;
}
