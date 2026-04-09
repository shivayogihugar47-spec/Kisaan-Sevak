create extension if not exists pgcrypto;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  category_key text not null default 'help',
  author text not null default 'Unknown',
  author_phone text,
  content text not null check (char_length(content) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author text not null default 'Unknown',
  author_phone text,
  comment text not null check (char_length(comment) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.community_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_phone text not null,
  user_name text,
  created_at timestamptz not null default now(),
  unique (post_id, user_phone)
);

create index if not exists idx_community_posts_created_at
  on public.community_posts (created_at desc);

create index if not exists idx_community_comments_post_id
  on public.community_post_comments (post_id, created_at asc);

create index if not exists idx_community_likes_post_id
  on public.community_post_likes (post_id);

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

alter table public.community_posts enable row level security;
alter table public.community_post_comments enable row level security;
alter table public.community_post_likes enable row level security;
alter table public.community_videos enable row level security;
alter table public.community_articles enable row level security;

drop policy if exists "community_posts_public_access" on public.community_posts;
create policy "community_posts_public_access"
on public.community_posts
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "community_comments_public_access" on public.community_post_comments;
create policy "community_comments_public_access"
on public.community_post_comments
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "community_likes_public_access" on public.community_post_likes;
create policy "community_likes_public_access"
on public.community_post_likes
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "community_videos_public_read" on public.community_videos;
create policy "community_videos_public_read"
on public.community_videos
for select
to anon, authenticated
using (true);

drop policy if exists "community_articles_public_read" on public.community_articles;
create policy "community_articles_public_read"
on public.community_articles
for select
to anon, authenticated
using (true);
