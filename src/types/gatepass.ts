import type { LucideIcon } from "lucide-react";

export type EventTheme = "luxury" | "party" | "concert" | "hostel" | "secure" | "workshop";

export type TicketStatus =
  | "Approved"
  | "Pending"
  | "Rejected"
  | "Expired"
  | "Checked In"
  | "Outside Geofence"
  | "Manual"
  | "Complimentary";

export type ScanResultState =
  | "VALID"
  | "ALREADY USED"
  | "INVALID"
  | "WRONG EVENT"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED"
  | "OUTSIDE GEOFENCE";

export type TicketCategory =
  | "General"
  | "VIP"
  | "Early Bird"
  | "Student"
  | "Faculty"
  | "Couple"
  | "Group Pass"
  | "Complimentary"
  | "Sponsor Pass"
  | "Volunteer Pass"
  | "Food Included"
  | "Night Out Pass"
  | "Day Out Pass";

export type EventItem = {
  slug: string;
  title: string;
  category: string;
  theme: EventTheme;
  date: string;
  time: string;
  city: string;
  venue: string;
  price: string;
  status: string;
  image: string;
  organizer: string;
  badges: string[];
};

export type Metric = {
  label: string;
  value: string;
  delta?: string;
  tone?: "success" | "warning" | "danger" | "neutral" | "manual" | "complimentary";
};

export type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export type TicketRow = {
  id: string;
  eventId: string;
  category: TicketCategory;
  buyer: string;
  attendee: string;
  contact: string;
  qrStatus: string;
  paymentId: string;
  status: string;
  scanStatus: string;
  scanTime: string;
  gate: string;
  refund: string;
};

export type AuditEvent = {
  actor: string;
  organization: string;
  event: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  device: string;
};
