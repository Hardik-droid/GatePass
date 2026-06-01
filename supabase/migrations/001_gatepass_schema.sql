create extension if not exists "pgcrypto";

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  owner_user_id uuid,
  contact_email text,
  contact_phone text,
  branding jsonb,
  payout_details jsonb,
  created_at timestamptz default now()
);

create table if not exists users_profile (
  id uuid primary key references auth.users(id),
  name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  user_id uuid references users_profile(id),
  role text not null,
  permissions jsonb,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  title text not null,
  slug text unique not null,
  description text,
  event_type text,
  venue text,
  city text,
  start_time timestamptz,
  end_time timestamptz,
  status text,
  visibility text,
  banner_url text,
  refund_policy text,
  terms text,
  capacity int,
  gps_required boolean default false,
  geofence jsonb,
  created_at timestamptz default now()
);

create table if not exists ticket_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  name text not null,
  description text,
  price_cents int default 0,
  currency text default 'INR',
  capacity int,
  sold_count int default 0,
  sale_start timestamptz,
  sale_end timestamptz,
  status text default 'active',
  per_user_limit int,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  buyer_user_id uuid nullable,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  payment_status text,
  payment_mode text,
  gross_amount_cents int,
  platform_fee_cents int default 0,
  gateway_fee_cents int default 0,
  net_amount_cents int,
  status text,
  idempotency_key text unique,
  created_at timestamptz default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  order_id uuid references orders(id),
  ticket_category_id uuid references ticket_categories(id),
  attendee_name text,
  attendee_phone text,
  attendee_email text,
  qr_token_hash text unique not null,
  qr_payload_version text default 'v1',
  status text,
  issued_at timestamptz,
  checked_in_at timestamptz,
  checked_in_by uuid nullable,
  checked_in_gate_id uuid nullable,
  created_at timestamptz default now()
);

create table if not exists scan_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id),
  event_id uuid references events(id),
  scanner_user_id uuid,
  gate_id uuid nullable,
  scan_result text not null,
  scan_time timestamptz default now(),
  device_id text,
  metadata jsonb
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  gateway text,
  gateway_order_id text,
  gateway_payment_id text,
  amount_cents int,
  currency text default 'INR',
  status text,
  method text,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  gross_sales_cents int,
  total_refunds_cents int,
  platform_fees_cents int,
  gateway_fees_cents int,
  manual_collections_cents int,
  net_settlement_cents int,
  status text,
  settled_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid nullable,
  organization_id uuid nullable,
  event_id uuid nullable,
  action text not null,
  entity_type text,
  entity_id uuid nullable,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  device_id text,
  created_at timestamptz default now()
);

create table if not exists notification_outbox (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient_email text,
  recipient_phone text,
  subject text,
  html text,
  text text,
  status text default 'queued',
  provider text,
  provider_message_id text,
  attempts int default 0,
  last_error text,
  related_order_id uuid nullable,
  related_ticket_id uuid nullable,
  created_at timestamptz default now(),
  sent_at timestamptz nullable
);

create table if not exists gates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  name text not null,
  status text default 'open',
  assigned_staff jsonb,
  created_at timestamptz default now()
);

create table if not exists gatepass_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid,
  organization_id uuid,
  reason text,
  destination text,
  expected_return_time timestamptz,
  emergency boolean default false,
  gps_permission_status text,
  approval_status text,
  workflow_status text,
  created_at timestamptz default now()
);

create table if not exists gps_location_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  gatepass_request_id uuid nullable,
  lat double precision,
  lng double precision,
  accuracy double precision,
  status text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table organizations enable row level security;
alter table users_profile enable row level security;
alter table organization_members enable row level security;
alter table events enable row level security;
alter table ticket_categories enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;
alter table scan_logs enable row level security;
alter table payments enable row level security;
alter table settlements enable row level security;
alter table audit_events enable row level security;
alter table notification_outbox enable row level security;
alter table gates enable row level security;
alter table gatepass_requests enable row level security;
alter table gps_location_logs enable row level security;
