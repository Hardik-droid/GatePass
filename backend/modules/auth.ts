import type { NextRequest } from "next/server";

export function getSession() {
  return { userId: "usr_demo", role: "OWNER", permissions: ["*"] };
}

export function requireApiPermission(_request: NextRequest, permission: string) {
  return { session: getSession(), permission };
}

export const getCurrentSession = getSession;
export const requirePermission = requireApiPermission;
export const getCurrentUser = getSession;
export const requireUser = getSession;
export function hasPermission() {
  return true;
}
export function requireOrgRole() {
  return getSession();
}
