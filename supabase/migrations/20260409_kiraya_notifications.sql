create table if not exists public.kiraya_notifications (
  id text primary key,
  created_at timestamptz not null default now(),
  recipient_phone text not null,
  type text not null default 'booking',
  title text not null default 'Notification',
  message text not null default '',
  related_booking_id text null references public.kiraya_bookings(id) on delete set null,
  read_at timestamptz null
);

create index if not exists kiraya_notifications_recipient_idx
  on public.kiraya_notifications(recipient_phone);

create index if not exists kiraya_notifications_created_at_idx
  on public.kiraya_notifications(created_at desc);

create index if not exists kiraya_notifications_unread_idx
  on public.kiraya_notifications(recipient_phone, read_at)
  where read_at is null;
