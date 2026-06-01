alter table users_profile
  add column if not exists wallet_preference text default 'ask',
  add column if not exists preferred_wallet_provider text,
  add column if not exists wallet_auto_prompt_seen boolean default false,
  add column if not exists wallet_last_selected_at timestamptz;

create table if not exists wallet_passes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  user_id uuid nullable,
  provider text not null,
  provider_pass_id text nullable unique,
  provider_class_id text nullable,
  serial_number text nullable,
  authentication_token_hash text nullable,
  status text not null default 'created',
  save_url text nullable,
  last_synced_at timestamptz nullable,
  last_error text nullable,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint wallet_passes_provider_check check (provider in ('apple', 'google')),
  constraint wallet_passes_status_check check (status in ('created', 'link_generated', 'downloaded', 'save_started', 'saved_unconfirmed', 'active', 'updated', 'voided', 'expired', 'revoked', 'failed')),
  unique(ticket_id, provider)
);

create table if not exists wallet_devices (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'apple',
  device_library_identifier text not null,
  push_token text nullable,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider, device_library_identifier)
);

create table if not exists wallet_pass_registrations (
  id uuid primary key default gen_random_uuid(),
  wallet_pass_id uuid not null references wallet_passes(id) on delete cascade,
  wallet_device_id uuid not null references wallet_devices(id) on delete cascade,
  created_at timestamptz default now(),
  unique(wallet_pass_id, wallet_device_id)
);

alter table tickets
  add column if not exists wallet_enabled boolean default true,
  add column if not exists apple_wallet_pass_id uuid nullable references wallet_passes(id),
  add column if not exists google_wallet_pass_id uuid nullable references wallet_passes(id),
  add column if not exists wallet_last_updated_at timestamptz;

alter table notification_outbox
  add column if not exists wallet_links jsonb,
  add column if not exists email_preview_html text,
  add column if not exists provider_message_id text,
  add column if not exists attempts int default 0,
  add column if not exists last_error text,
  add column if not exists sent_at timestamptz;
