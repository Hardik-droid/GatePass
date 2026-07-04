import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type StateRow = {
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};

let sqlClient: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function getNeonDatabaseUrl() {
  return process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
}

export function isNeonConfigured() {
  return Boolean(getNeonDatabaseUrl());
}

export function getNeonSql() {
  const databaseUrl = getNeonDatabaseUrl();
  if (!databaseUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Neon DATABASE_URL is not configured");
    }
    return null;
  }

  sqlClient ??= neon(databaseUrl);
  return sqlClient;
}

export async function ensureNeonSchema() {
  const sql = getNeonSql();
  if (!sql) return;

  schemaReady ??= (async () => {
    await sql.query(`
      create table if not exists public.gatepass_state (
        entity_type text not null,
        entity_id text not null,
        payload jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        primary key (entity_type, entity_id)
      )
    `);

    await sql.query(`
      create table if not exists public.users_profile (
        id text primary key,
        name text,
        email text,
        phone text,
        avatar_url text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);

    await sql.query(`
      create index if not exists gatepass_state_entity_type_idx
      on public.gatepass_state (entity_type, created_at)
    `);
  })();

  await schemaReady;
}

export async function checkNeonConnection() {
  const sql = getNeonSql();
  if (!sql) return { configured: false, ok: false, error: "DATABASE_URL is not configured" };

  try {
    await ensureNeonSchema();
    const [row] = await sql.query("select current_database() as database_name, current_user as database_user");
    return {
      configured: true,
      ok: true,
      databaseName: typeof row?.database_name === "string" ? row.database_name : undefined,
      databaseUser: typeof row?.database_user === "string" ? row.database_user : undefined,
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Neon connection error",
    };
  }
}

export async function loadStateRows() {
  const sql = getNeonSql();
  if (!sql) return [] as StateRow[];

  await ensureNeonSchema();
  return (await sql.query(
    `
      select entity_type, entity_id, payload, created_at, updated_at
      from public.gatepass_state
      order by created_at asc
    `,
  )) as StateRow[];
}

export async function upsertStateRow(entityType: string, entityId: string, payload: Record<string, unknown>) {
  const sql = getNeonSql();
  if (!sql) return;

  await ensureNeonSchema();
  await sql.query(
    `
      insert into public.gatepass_state (entity_type, entity_id, payload, updated_at)
      values ($1, $2, $3::jsonb, now())
      on conflict (entity_type, entity_id)
      do update set payload = excluded.payload, updated_at = now()
    `,
    [entityType, entityId, JSON.stringify(payload)],
  );
}

export async function upsertStateRows(rows: Array<{ entityType: string; entityId: string; payload: Record<string, unknown> }>) {
  const sql = getNeonSql();
  if (!sql || !rows.length) return;

  await ensureNeonSchema();
  const values = rows.map((row) => [row.entityType, row.entityId, JSON.stringify(row.payload)]);
  await sql.transaction(
    values.map((value) =>
      sql.query(
        `
          insert into public.gatepass_state (entity_type, entity_id, payload, updated_at)
          values ($1, $2, $3::jsonb, now())
          on conflict (entity_type, entity_id)
          do update set payload = excluded.payload, updated_at = now()
        `,
        value,
      ),
    ),
  );
}

export async function deleteStateRow(entityType: string, entityId: string) {
  const sql = getNeonSql();
  if (!sql) return;

  await ensureNeonSchema();
  await sql.query(
    `
      delete from public.gatepass_state
      where entity_type = $1 and entity_id = $2
    `,
    [entityType, entityId],
  );
}

export async function upsertUserProfile(profile: Record<string, unknown>) {
  const sql = getNeonSql();
  if (!sql) return;

  const id = String(profile.id ?? profile.userId ?? "");
  if (!id) return;

  await ensureNeonSchema();
  await sql.query(
    `
      insert into public.users_profile (id, name, email, phone, avatar_url, updated_at)
      values ($1, $2, $3, $4, $5, now())
      on conflict (id)
      do update set
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        avatar_url = excluded.avatar_url,
        updated_at = now()
    `,
    [
      id,
      profile.name ?? null,
      profile.email ?? null,
      profile.phone ?? null,
      profile.avatarUrl ?? profile.avatar_url ?? null,
    ],
  );
}
