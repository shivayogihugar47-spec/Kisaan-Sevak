alter table if exists public.app_users
  add column if not exists account_status text not null default 'active',
  add column if not exists kyc_status text not null default 'pending',
  add column if not exists is_enterprise_verified boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_app_users_account_status on public.app_users (account_status);
create index if not exists idx_app_users_kyc_status on public.app_users (kyc_status);
