alter table if exists public.app_users
  add column if not exists kyc_full_name text,
  add column if not exists kyc_id_type text,
  add column if not exists kyc_id_number text,
  add column if not exists kyc_document_url text,
  add column if not exists kyc_address text,
  add column if not exists kyc_submitted_at timestamptz,
  add column if not exists kyc_verified_at timestamptz,
  add column if not exists kyc_rejection_reason text;

create index if not exists idx_app_users_kyc_submitted_at on public.app_users (kyc_submitted_at desc);
