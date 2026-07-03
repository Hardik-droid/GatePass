import { getServerSession, type GatePassSession } from "@/authO/lib/server/session";
import { HttpError } from "../core/http";

const ownerPermissions = new Set([
  "dashboard:read",
  "events:write",
  "tickets:read",
  "tickets:write",
  "orders:read",
  "orders:write",
  "payments:read",
  "payments:write",
  "scanner:lookup",
  "scanner:validate",
  "reports:read",
  "settlements:read",
  "notifications:read",
  "notifications:write",
  "team:read",
  "team:write",
]);

const scannerPermissions = new Set(["scanner:lookup", "scanner:validate", "tickets:read"]);
const attendeePermissions = new Set(["orders:write", "tickets:own", "wallet:own", "gatepass:request", "gps:write"]);

function permissionsFor(role: GatePassSession["role"]) {
  if (role === "owner") return ownerPermissions;
  if (role === "scanner") return scannerPermissions;
  return attendeePermissions;
}

export async function getSession() {
  return getServerSession();
}

export async function requireUser() {
  const session = await getServerSession();
  if (!session) throw new HttpError(401, "Authentication required");
  return session;
}

export async function requireApiPermission(_request: Request, permission: string) {
  const session = await requireUser();
  if (!permissionsFor(session.role).has(permission)) {
    throw new HttpError(403, "Permission denied");
  }
  return { session, permission };
}

export async function hasPermission(permission: string) {
  const session = await getServerSession();
  return Boolean(session && permissionsFor(session.role).has(permission));
}

export async function requireOrgRole(_organizationId?: string, role: GatePassSession["role"] = "owner") {
  const session = await requireUser();
  if (session.role !== role && session.role !== "owner") {
    throw new HttpError(403, "Organization role required");
  }
  return session;
}

export function canAccessTicket(
  session: GatePassSession,
  ticket?: { attendeeEmail?: string; attendeePhone?: string },
) {
  if (!ticket) return false;
  if (session.role === "owner" || session.role === "scanner") return true;
  const sessionPhone = (session as GatePassSession & { phone?: string }).phone;
  return ticket.attendeeEmail === session.email || Boolean(sessionPhone && ticket.attendeePhone === sessionPhone);
}

export async function requireTicketAccess(ticket?: { attendeeEmail?: string; attendeePhone?: string }) {
  const session = await requireUser();
  if (!canAccessTicket(session, ticket)) {
    throw new HttpError(ticket ? 403 : 404, ticket ? "Ticket access denied" : "Ticket not found");
  }
  return session;
}

export const getCurrentSession = getSession;
export const requirePermission = requireApiPermission;
export const getCurrentUser = requireUser;
