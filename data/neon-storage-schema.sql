-- Master Neon/Postgres schema for all Supabase-backed tables still used by this app.
-- Safe to run on a fresh database, and mostly safe to re-run on an existing one.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Users / auth
-- ---------------------------------------------------------------------------

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  username text not null unique,
  password_hash text,
  password text,
  phone text,
  name text not null default 'User',
  portal text not null default 'farmer',
  profile_image_url text,
  bio text,
  location_label text,
  farm_size text,
  main_crop text,
  date_of_birth date,
  gender text,
  district text,
  state text,
  pincode text,
  farming_experience_years integer,
  farming_type text,
  irrigation_type text,
  soil_type text,
  primary_language text,
  secondary_phone text,
  whatsapp_number text,
  account_status text not null default 'active',
  kyc_status text not null default 'pending',
  is_enterprise_verified boolean not null default false,
  kyc_full_name text,
  kyc_id_type text,
  kyc_id_number text,
  kyc_document_url text,
  kyc_address text,
  kyc_submitted_at timestamptz,
  kyc_verified_at timestamptz,
  kyc_rejection_reason text
);

alter table if exists public.app_users
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists username text,
  add column if not exists password_hash text,
  add column if not exists password text,
  add column if not exists phone text,
  add column if not exists name text not null default 'User',
  add column if not exists portal text not null default 'farmer',
  add column if not exists profile_image_url text,
  add column if not exists bio text,
  add column if not exists location_label text,
  add column if not exists farm_size text,
  add column if not exists main_crop text,
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
  add column if not exists account_status text not null default 'active',
  add column if not exists kyc_status text not null default 'pending',
  add column if not exists is_enterprise_verified boolean not null default false,
  add column if not exists kyc_full_name text,
  add column if not exists kyc_id_type text,
  add column if not exists kyc_id_number text,
  add column if not exists kyc_document_url text,
  add column if not exists kyc_address text,
  add column if not exists kyc_submitted_at timestamptz,
  add column if not exists kyc_verified_at timestamptz,
  add column if not exists kyc_rejection_reason text;

create unique index if not exists idx_app_users_username on public.app_users (username);
create index if not exists idx_app_users_auth on public.app_users (username, password_hash);
create index if not exists idx_app_users_phone on public.app_users (phone);
create index if not exists idx_app_users_state_district on public.app_users (state, district);
create index if not exists idx_app_users_main_crop on public.app_users (main_crop);
create index if not exists idx_app_users_account_status on public.app_users (account_status);
create index if not exists idx_app_users_kyc_status on public.app_users (kyc_status);
create index if not exists idx_app_users_kyc_submitted_at on public.app_users (kyc_submitted_at desc);

-- ---------------------------------------------------------------------------
-- OTP / phone verification
-- ---------------------------------------------------------------------------

create table if not exists public.otp_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  attempts integer not null default 0
);

create index if not exists idx_otp_requests_phone on public.otp_requests (phone);
create index if not exists idx_otp_requests_created_at on public.otp_requests (created_at desc);
create index if not exists idx_otp_requests_phone_created_at on public.otp_requests (phone, created_at desc);

-- ---------------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------------

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  description text,
  content text,
  url text,
  "urlToImage" text,
  source_name text,
  author text,
  category text,
  query text,
  "publishedAt" timestamptz not null default now(),
  is_active boolean not null default true
);

create index if not exists idx_news_articles_published_at on public.news_articles ("publishedAt" desc);
create index if not exists idx_news_articles_title_lower on public.news_articles (lower(title));

-- ---------------------------------------------------------------------------
-- Government schemes
-- ---------------------------------------------------------------------------

create table if not exists public.government_schemes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text unique,
  category text not null,
  title_en text not null,
  title_hi text,
  title_kn text,
  subtitle_en text not null,
  subtitle_hi text,
  subtitle_kn text,
  official_link text not null,
  benefit_en text,
  target_en text,
  funding_en text,
  tenure_en text,
  is_active boolean not null default true,
  priority integer not null default 0
);

create index if not exists idx_government_schemes_active on public.government_schemes (is_active, priority desc, created_at desc);
create index if not exists idx_government_schemes_category on public.government_schemes (category);

-- ---------------------------------------------------------------------------
-- Community
-- ---------------------------------------------------------------------------

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  category_key text not null default 'help',
  author text not null default 'Unknown',
  author_username text,
  author_phone text,
  content text not null check (char_length(content) > 0),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author text not null default 'Unknown',
  author_username text,
  author_phone text,
  comment text not null check (char_length(comment) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.community_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_username text not null,
  user_name text,
  user_phone text,
  created_at timestamptz not null default now(),
  unique (post_id, user_username)
);

create table if not exists public.community_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  duration text,
  views text,
  video_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  read_time text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_posts_created_at on public.community_posts (created_at desc);
create index if not exists idx_community_posts_author_username on public.community_posts (author_username);
create index if not exists idx_community_comments_post_id on public.community_post_comments (post_id, created_at asc);
create index if not exists idx_community_likes_post_id on public.community_post_likes (post_id);
create index if not exists idx_community_likes_user_username on public.community_post_likes (user_username);

-- ---------------------------------------------------------------------------
-- Krishi Kiraya
-- ---------------------------------------------------------------------------

create table if not exists public.kiraya_vehicles (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  category text not null default 'Tractor',
  owner_id text,
  owner_phone text not null,
  owner_name text not null,
  location text not null,
  distance_km numeric not null default 0,
  price_per_hour numeric not null default 0,
  fuel_type text not null default 'Diesel',
  rating numeric not null default 5,
  reviews integer not null default 0,
  available boolean not null default true,
  image_url text,
  hp text,
  operator_included boolean not null default false,
  delivery_available boolean not null default false,
  min_duration text not null default '3h',
  address text
);

create table if not exists public.kiraya_bookings (
  id text primary key,
  created_at timestamptz not null default now(),
  booked_at timestamptz not null default now(),
  vehicle_id text not null references public.kiraya_vehicles(id) on delete cascade,
  vehicle_name text not null,
  owner_id text,
  owner_name text not null,
  owner_phone text not null,
  renter_id text,
  renter_name text not null,
  renter_phone text not null,
  hours numeric not null default 1,
  total_price numeric not null default 0,
  status text not null default 'confirmed',
  location text
);

create table if not exists public.kiraya_notifications (
  id text primary key,
  created_at timestamptz not null default now(),
  recipient_id text not null,
  recipient_phone text,
  type text not null default 'booking',
  title text not null default 'Notification',
  message text not null default '',
  related_booking_id text null references public.kiraya_bookings(id) on delete set null,
  read_at timestamptz null
);

create index if not exists kiraya_vehicles_created_at_idx on public.kiraya_vehicles(created_at desc);
create index if not exists kiraya_vehicles_owner_phone_idx on public.kiraya_vehicles(owner_phone);
create index if not exists kiraya_vehicles_available_idx on public.kiraya_vehicles(available);
create index if not exists kiraya_bookings_booked_at_idx on public.kiraya_bookings(booked_at desc);
create index if not exists kiraya_bookings_owner_phone_idx on public.kiraya_bookings(owner_phone);
create index if not exists kiraya_bookings_renter_phone_idx on public.kiraya_bookings(renter_phone);
create index if not exists kiraya_notifications_recipient_id_idx on public.kiraya_notifications(recipient_id);
create index if not exists kiraya_notifications_recipient_phone_idx on public.kiraya_notifications(recipient_phone);
create index if not exists kiraya_notifications_created_at_idx on public.kiraya_notifications(created_at desc);
create index if not exists kiraya_notifications_unread_idx on public.kiraya_notifications(recipient_id, read_at) where read_at is null;

-- ---------------------------------------------------------------------------
-- Marketplace auctions
-- ---------------------------------------------------------------------------

create table if not exists public.auctions (
  id text primary key,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  completed_at timestamptz null,
  expires_at timestamptz null,
  seller_id text null,
  seller_phone text null,
  seller_name text null,
  residue_type text not null,
  quantity_tons numeric not null default 0,
  base_price_total numeric not null default 0,
  allowed_buyer_types text[] not null default '{}'::text[],
  accepted_bid_id text null
);

create table if not exists public.auction_bids (
  id text primary key,
  auction_id text not null references public.auctions(id) on delete cascade,
  created_at timestamptz not null default now(),
  buyer_id text null,
  buyer_phone text null,
  buyer_name text null,
  buyer_type text null,
  amount_total numeric not null default 0
);

alter table if exists public.auctions
  add column if not exists seller_id text null;

alter table if exists public.auction_bids
  add column if not exists buyer_id text null;

create index if not exists auctions_status_idx on public.auctions(status);
create index if not exists auctions_created_at_idx on public.auctions(created_at desc);
create index if not exists auction_bids_auction_id_idx on public.auction_bids(auction_id);
create index if not exists auction_bids_created_at_idx on public.auction_bids(created_at desc);

-- ---------------------------------------------------------------------------
-- Enterprise contracts
-- ---------------------------------------------------------------------------

create table if not exists public.enterprise_contracts (
  id bigserial primary key,
  enterprise_id text not null,
  created_at timestamptz not null default now(),
  title text not null,
  farmer_name text not null,
  crop text not null,
  quantity text null,
  value text null,
  status text not null default 'active',
  signed_at timestamptz null
);

create index if not exists enterprise_contracts_enterprise_id_idx on public.enterprise_contracts(enterprise_id);
create index if not exists enterprise_contracts_created_at_idx on public.enterprise_contracts(created_at desc);
