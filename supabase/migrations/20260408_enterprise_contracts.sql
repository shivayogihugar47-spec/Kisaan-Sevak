-- Enterprise contracts backing table.
-- This app currently uses OTP session auth (not Supabase Auth), so RLS is not enabled here.

create table if not exists public.enterprise_contracts (
  id bigserial primary key,
  enterprise_id text not null,
  created_at timestamptz not null default now(),
  title text not null,
  farmer_name text not null,
  crop text not null,
  quantity text null,
  value text null,
  status text not null default 'active', -- active | signed
  signed_at timestamptz null
);

create index if not exists enterprise_contracts_enterprise_id_idx on public.enterprise_contracts(enterprise_id);
create index if not exists enterprise_contracts_created_at_idx on public.enterprise_contracts(created_at desc);

