-- Auctions + bids backing table for the marketplace.
-- Designed to work with the current OTP session auth (no Supabase Auth required),
-- so we do NOT enable RLS here by default.

create table if not exists public.auctions (
  id text primary key,
  status text not null default 'active', -- active | completed | expired
  created_at timestamptz not null default now(),
  completed_at timestamptz null,
  expires_at timestamptz null,
  seller_phone text null,
  seller_name text null,
  residue_type text not null,
  quantity_tons numeric not null default 0,
  base_price_total numeric not null default 0,
  allowed_buyer_types text[] not null default '{}'::text[],
  accepted_bid_id text null
);

create index if not exists auctions_status_idx on public.auctions(status);
create index if not exists auctions_created_at_idx on public.auctions(created_at desc);

create table if not exists public.auction_bids (
  id text primary key,
  auction_id text not null references public.auctions(id) on delete cascade,
  created_at timestamptz not null default now(),
  buyer_phone text null,
  buyer_name text null,
  buyer_type text null,
  amount_total numeric not null default 0
);

create index if not exists auction_bids_auction_id_idx on public.auction_bids(auction_id);
create index if not exists auction_bids_created_at_idx on public.auction_bids(created_at desc);

