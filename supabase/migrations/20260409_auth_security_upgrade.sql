-- Add password column to app_users if not exists
alter table if exists public.app_users 
add column if not exists password text;

-- Add index for identifier (phone) lookups if not already there
create index if not exists idx_app_users_phone on public.app_users (phone);
