alter table if exists public.app_users
  add column if not exists profile_image_url text,
  add column if not exists bio text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists district text,
  add column if not exists state text,
  add column if not exists pincode text,
  add column if not exists farming_experience_years integer,
  add column if not exists farming_type text,
  add column if not exists irrigation_type text,
  add column if not exists soil_type text,
  add column if not exists primary_language text,
  add column if not exists secondary_phone text,
  add column if not exists whatsapp_number text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_app_users_state_district on public.app_users (state, district);
create index if not exists idx_app_users_main_crop on public.app_users (main_crop);
