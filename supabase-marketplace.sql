-- rvchain production marketplace (gear & parts)
-- Run in Supabase SQL Editor after core auth is enabled.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  display_name text,
  contact_email text,
  contact_phone text,
  seller_pro boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists seller_pro boolean not null default false,
  add column if not exists is_admin boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- Listings
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('gear', 'parts')),
  title text not null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  condition text not null default 'good',
  city text not null default '',
  state text not null default '',
  category text not null default 'other',
  images text[] not null default '{}',
  contact_email text,
  contact_phone text,
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'sold', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_listings_status_idx
  on public.marketplace_listings (status, featured desc, created_at desc);
create index if not exists marketplace_listings_user_idx
  on public.marketplace_listings (user_id);
create index if not exists marketplace_listings_kind_idx
  on public.marketplace_listings (kind);

-- Contact form submissions
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, contact_email, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.contact_messages enable row level security;

-- Profiles: public read minimal; users update own
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Listings: anyone can read active; owners manage own
drop policy if exists "listings_select_active" on public.marketplace_listings;
create policy "listings_select_active" on public.marketplace_listings
  for select using (status = 'active' or auth.uid() = user_id);

drop policy if exists "listings_insert_own" on public.marketplace_listings;
create policy "listings_insert_own" on public.marketplace_listings
  for insert with check (auth.uid() = user_id);

drop policy if exists "listings_update_own" on public.marketplace_listings;
create policy "listings_update_own" on public.marketplace_listings
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "listings_delete_own" on public.marketplace_listings;
create policy "listings_delete_own" on public.marketplace_listings
  for delete using (auth.uid() = user_id);

-- Contact: anyone can insert
drop policy if exists "contact_insert_any" on public.contact_messages;
create policy "contact_insert_any" on public.contact_messages
  for insert with check (true);

-- Storage bucket for listing photos (run in dashboard or via API)
-- Storage > New bucket: listing-images, public
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "listing_images_public_read" on storage.objects;
create policy "listing_images_public_read" on storage.objects
  for select using (bucket_id = 'listing-images');

drop policy if exists "listing_images_auth_upload" on storage.objects;
create policy "listing_images_auth_upload" on storage.objects
  for insert with check (
    bucket_id = 'listing-images' and auth.role() = 'authenticated'
  );

drop policy if exists "listing_images_auth_update" on storage.objects;
create policy "listing_images_auth_update" on storage.objects
  for update using (
    bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "listing_images_auth_delete" on storage.objects;
create policy "listing_images_auth_delete" on storage.objects
  for delete using (
    bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
  );
