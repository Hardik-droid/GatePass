import { createId } from "../core/ids";
import { getStore } from "../core/store";

export function listOrganizations() {
  return getStore().organizations;
}

export function createOrganization(payload: Record<string, unknown>) {
  const organization = { id: createId("org"), name: String(payload.name ?? "GatePass Org"), ...payload };
  getStore().organizations.push(organization);
  return { organization };
}
