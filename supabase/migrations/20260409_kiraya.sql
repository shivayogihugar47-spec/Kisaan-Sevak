-- Krishi Kiraya: vehicles and booking tables.
-- OTP session app (no Supabase Auth user binding), so RLS is disabled by design.

create table if not exists public.kiraya_vehicles (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  category text not null default 'Tractor',
  owner_phone text not null,
  owner_name text not null,
  location text not null,
  distance_km numeric not null default 0,
  price_per_hour numeric not null default 0,
  fuel_type text not null default 'Diesel',
  rating numeric not null default 5,
  available boolean not null default true
);

create index if not exists kiraya_vehicles_created_at_idx on public.kiraya_vehicles(created_at desc);
create index if not exists kiraya_vehicles_owner_phone_idx on public.kiraya_vehicles(owner_phone);
create index if not exists kiraya_vehicles_available_idx on public.kiraya_vehicles(available);

create table if not exists public.kiraya_bookings (
  id text primary key,
  created_at timestamptz not null default now(),
  booked_at timestamptz not null default now(),
  vehicle_id text not null references public.kiraya_vehicles(id) on delete cascade,
  vehicle_name text not null,
  owner_name text not null,
  owner_phone text not null,
  renter_name text not null,
  renter_phone text not null,
  hours numeric not null default 1,
  total_price numeric not null default 0,
  status text not null default 'confirmed', -- confirmed | completed | cancelled
  location text null
);

create index if not exists kiraya_bookings_booked_at_idx on public.kiraya_bookings(booked_at desc);
create index if not exists kiraya_bookings_owner_phone_idx on public.kiraya_bookings(owner_phone);
create index if not exists kiraya_bookings_renter_phone_idx on public.kiraya_bookings(renter_phone);
