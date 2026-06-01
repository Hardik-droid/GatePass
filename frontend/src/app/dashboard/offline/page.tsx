import { MatrixPage } from "@/components/gatepass/admin-pages";

export default function OfflinePage() {
  return <MatrixPage title="Offline Mode" items={["Online-first MVP", "Pre-download event ticket token list", "Scanner works offline for limited time", "Local scan cache", "Sync when network returns", "Conflict resolution", "First valid timestamp wins", "Later scan becomes duplicate"]} />;
}
