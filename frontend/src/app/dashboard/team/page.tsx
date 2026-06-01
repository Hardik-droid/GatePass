import { MatrixPage } from "@/components/gatepass/admin-pages";

export default function TeamRolesPage() {
  return (
    <MatrixPage
      title="Team & Roles"
      items={["Owner", "Event Manager", "Finance Manager", "Gate Staff", "Scanner Staff", "Volunteer", "Viewer", "Create event", "View finance", "Issue manual ticket", "Scan ticket", "Approve refund", "Export reports", "Manage payout", "View audit logs", "View GPS tracking"]}
    />
  );
}
