-- Password Authentication Migration
-- Clean setup for username/password auth

-- Clean up any existing issues first
ALTER TABLE IF EXISTS public.app_users DROP CONSTRAINT IF EXISTS app_users_username_unique CASCADE;
DROP INDEX IF EXISTS app_users_username_key;
DROP INDEX IF EXISTS idx_app_users_username;
DROP INDEX IF EXISTS idx_app_users_auth;

-- Drop and recreate username cleanly
ALTER TABLE IF EXISTS public.app_users DROP COLUMN IF EXISTS username CASCADE;
ALTER TABLE IF EXISTS public.app_users ADD COLUMN username TEXT;

-- Add password_hash if needed
ALTER TABLE IF EXISTS public.app_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Generate unique usernames from IDs (guaranteed unique)
UPDATE public.app_users 
SET username = 'user_' || SUBSTR(id::TEXT, 1, 16)
WHERE username IS NULL;

-- Apply constraints
ALTER TABLE IF EXISTS public.app_users ALTER COLUMN username SET NOT NULL;
ALTER TABLE IF EXISTS public.app_users ADD CONSTRAINT app_users_username_unique UNIQUE (username);

-- Make phone optional
ALTER TABLE IF EXISTS public.app_users ALTER COLUMN phone DROP NOT NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users (username);
CREATE INDEX IF NOT EXISTS idx_app_users_auth ON public.app_users (username, password_hash);
