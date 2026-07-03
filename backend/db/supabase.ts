import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/utils/supabase/env";

type StateRow = {
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};

let adminClient: SupabaseClient | null = null;

function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}

export function isSupabaseConfigured() {
  return hasSupabaseConfig();
}

export function getSupabaseAdminClient() {
  if (!hasSupabaseConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Supabase is not configured");
    }
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return adminClient;
}

export async function loadStateRows() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [] as StateRow[];

  const { data, error } = await supabase
    .from("gatepass_state")
    .select("entity_type, entity_id, payload, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load Supabase state: ${error.message}`);
  }

  return (data ?? []) as StateRow[];
}

export async function upsertStateRow(entityType: string, entityId: string, payload: Record<string, unknown>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from("gatepass_state").upsert(
    {
      entity_type: entityType,
      entity_id: entityId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "entity_type,entity_id" },
  );

  if (error) {
    const msg = `Failed to persist ${entityType}:${entityId} to Supabase: ${error.message}`;
    if (process.env.NODE_ENV === "production") throw new Error(msg);
    console.warn(`[dev] ${msg}`);
  }
}

export async function upsertStateRows(rows: Array<{ entityType: string; entityId: string; payload: Record<string, unknown> }>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !rows.length) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from("gatepass_state").upsert(
    rows.map((row) => ({
      entity_type: row.entityType,
      entity_id: row.entityId,
      payload: row.payload,
      updated_at: now,
    })),
    { onConflict: "entity_type,entity_id" },
  );

  if (error) {
    const msg = `Failed to persist Supabase state batch: ${error.message}`;
    if (process.env.NODE_ENV === "production") throw new Error(msg);
    console.warn(`[dev] ${msg}`);
  }
}

export async function deleteStateRow(entityType: string, entityId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("gatepass_state")
    .delete()
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error) {
    const msg = `Failed to delete ${entityType}:${entityId} from Supabase: ${error.message}`;
    if (process.env.NODE_ENV === "production") throw new Error(msg);
    console.warn(`[dev] ${msg}`);
  }
}

export async function upsertUserProfile(profile: Record<string, unknown>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const id = String(profile.id ?? profile.userId ?? "");
  if (!id) return;

  const { error } = await supabase.from("users_profile").upsert(
    {
      id,
      name: profile.name ?? null,
      email: profile.email ?? null,
      phone: profile.phone ?? null,
      avatar_url: profile.avatarUrl ?? profile.avatar_url ?? null,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to persist user profile ${id}: ${error.message}`);
  }
}
