-- ============================================
-- rvchain Supabase Setup SQL
-- Run this ENTIRE script in your Supabase project's SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- ============================================

-- 1. Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 2. Create tables
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists parks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  city text,
  state text,
  lat double precision,
  lng double precision,
  rating double precision default 4.5,
  price integer,
  amenities text[] default '{}',
  description text,
  image text,
  submitted_by uuid references auth.users,
  verified boolean default false,
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz default now()
);

-- Migration for existing databases (safe to re-run)
alter table parks add column if not exists verified_at timestamptz;
alter table parks add column if not exists verified_by text;

create table if not exists chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  username text not null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists forum_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  username text not null,
  category text not null check (category in ('rv', 'tent', 'all')),
  subcategory text not null check (subcategory in ('destinations', 'construction', 'maintenance')),
  title text not null,
  body text not null,
  author_avatar text,
  created_at timestamptz default now()
);

create index if not exists forum_posts_category_subcategory_idx
  on forum_posts (category, subcategory, created_at desc);

create table if not exists trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists trip_parks (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips on delete cascade not null,
  park_id uuid references parks on delete cascade not null,
  visit_order integer default 0,
  notes text,
  created_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table parks enable row level security;
alter table chat_messages enable row level security;
alter table forum_posts enable row level security;
alter table trips enable row level security;
alter table trip_parks enable row level security;

-- 4. RLS Policies (secure by default)
-- Profiles
create policy "Public profiles are viewable by everyone." 
  on profiles for select using (true);

create policy "Users can insert their own profile." 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile." 
  on profiles for update using (auth.uid() = id);

-- Parks: public read, logged-in can submit, owners can update their submissions
create policy "Parks are publicly viewable." 
  on parks for select using (true);

create policy "Authenticated users can submit new parks." 
  on parks for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own park submissions." 
  on parks for update using (auth.uid() = submitted_by);

-- Allow updates for verification (even if not owner, for moderator demo)
create policy "Anyone can mark parks as verified (demo)." 
  on parks for update using (true) with check (verified = true);

-- Chat messages: public read, authenticated insert
create policy "Chat messages are publicly viewable." 
  on chat_messages for select using (true);

create policy "Authenticated users can send chat messages." 
  on chat_messages for insert with check (auth.role() = 'authenticated');

-- Forum posts: public read, authenticated insert
create policy "Forum posts are publicly viewable."
  on forum_posts for select using (true);

create policy "Authenticated users can create forum posts."
  on forum_posts for insert with check (auth.role() = 'authenticated');

-- Trips: private to owner
create policy "Users can view their own trips." 
  on trips for select using (auth.uid() = user_id);

create policy "Users can create their own trips." 
  on trips for insert with check (auth.uid() = user_id);

create policy "Users can update their own trips." 
  on trips for update using (auth.uid() = user_id);

create policy "Users can delete their own trips." 
  on trips for delete using (auth.uid() = user_id);

-- Trip parks: only through owned trips
create policy "Users can view parks in their trips." 
  on trip_parks for select using (
    exists (select 1 from trips where trips.id = trip_parks.trip_id and trips.user_id = auth.uid())
  );

create policy "Users can manage parks in their trips." 
  on trip_parks for all using (
    exists (select 1 from trips where trips.id = trip_parks.trip_id and trips.user_id = auth.uid())
  );

-- 5. Enable Realtime (critical for live chat)
-- After running this SQL, go to Supabase Dashboard > Database > Replication
-- Enable Realtime for: chat_messages, parks, trips, trip_parks

-- 6. Seed 25 FICTIONAL demo parks (verified = true for originals)
-- Names and cities are invented sample data — not real businesses or brands.
INSERT INTO parks (name, city, state, lat, lng, rating, price, amenities, description, image, verified) VALUES
('Pinehollow Loop Camp', 'Cedar Bend', 'MT', 44.659, -111.099, 4.6, 55, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Demo sample: spacious pads among pines. Fictional spot for UI only.', '/spots/spot-red-rock.jpg', true),
('Red Mesa Rest', 'Sand Hollow', 'UT', 37.188, -113.004, 4.8, 68, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: red-rock views. Fictional listing — not a real resort.', '/spots/spot-coast.jpg', true),
('Rimrock Trailer Grove', 'Canyon Gate', 'AZ', 35.973, -112.142, 4.3, 42, ARRAY['Full Hookups', 'Dump Station', 'Pet Friendly', 'Store'], 'Demo sample: quiet nights near rim country. Fictional data.', '/spots/spot-alpine-lake.jpg', true),
('Bluewater Pad Park', 'Shoreline', 'AZ', 36.912, -111.455, 4.5, 49, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Propane'], 'Demo sample: lakeside feel. Fictional only.', '/spots/spot-redwoods.jpg', true),
('Sierra Gate RV Rest', 'Oakridge', 'CA', 37.328, -119.649, 4.7, 72, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: large pull-throughs. Not a real business.', '/spots/spot-river.jpg', true),
('Harbor Mist Camp', 'Seacliff', 'CA', 35.366, -120.849, 4.4, 58, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Dump Station'], 'Demo sample: coastal breeze. Fictional spot only.', '/spots/spot-beach.jpg', true),
('Tallwood Grove Camp', 'Fogline', 'CA', 41.753, -124.195, 4.9, 65, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'Demo sample: among giant trees. Fictional listing.', '/spots/spot-starry.jpg', true),
('Gorge Wind Rest', 'Riverbend', 'OR', 45.705, -121.521, 4.6, 52, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Demo sample: canyon views. Not a real park.', '/spots/spot-red-rock.jpg', true),
('Summit Meadow Pads', 'Highpass', 'WA', 46.756, -121.998, 4.5, 60, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Store'], 'Demo sample: mountain meadow. Fictional data only.', '/spots/spot-coast.jpg', true),
('Elktrail RV Rest', 'Pineview', 'CO', 40.376, -105.511, 4.7, 75, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Demo sample: alpine foothills. Not a real resort.', '/spots/spot-alpine-lake.jpg', true),
('Prairie Butte Camp', 'Dustline', 'SD', 43.992, -102.244, 4.2, 38, ARRAY['Full Hookups', 'Dump Station', 'Pet Friendly', 'Store'], 'Demo sample: wide skies. Fictional spot only.', '/spots/spot-redwoods.jpg', true),
('Hillfork Family Camp', 'Clearwater', 'TX', 30.047, -99.145, 4.8, 48, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: rolling hills. Fictional listing.', '/spots/spot-river.jpg', true),
('Saltbreeze Pads', 'Bayfront', 'TX', 29.287, -94.797, 4.3, 45, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Pool'], 'Demo sample: near the gulf shore. Not a real business.', '/spots/spot-beach.jpg', true),
('Starfall Desert Camp', 'Terrawell', 'TX', 29.316, -103.615, 4.6, 52, ARRAY['Full Hookups', 'Pet Friendly', 'Dump Station', 'Propane'], 'Demo sample: dark-sky desert. Fictional data for demo only.', '/spots/spot-starry.jpg', true),
('Mangrove Loop Camp', 'Sawgrass', 'FL', 25.462, -80.477, 4.4, 55, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: subtropical birding country. Not a real park.', '/spots/spot-red-rock.jpg', true),
('Keyline Harbor Rest', 'Coral Point', 'FL', 24.554, -81.755, 4.1, 82, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: southernmost fictional resort vibe. Sample UI only.', '/spots/spot-coast.jpg', true),
('Ridgepath Family Camp', 'Millcreek', 'NC', 35.486, -83.315, 4.7, 47, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'Demo sample: forest ridges. Fictional spot.', '/spots/spot-alpine-lake.jpg', true),
('Smoky Creek Pads', 'Hearthwood', 'TN', 35.787, -83.554, 4.5, 58, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: family mountain loops. Not affiliated with any real venue.', '/spots/spot-redwoods.jpg', true),
('Mirrorlake Camp', 'Northshore', 'NY', 43.421, -73.712, 4.3, 52, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'Demo sample: lake-country setting. Fictional listing only.', '/spots/spot-river.jpg', true),
('Tidepine Rest', 'Harborwick', 'ME', 44.388, -68.203, 4.8, 69, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Demo sample: rocky coast and pines. Not a real park.', '/spots/spot-beach.jpg', true),
('Duneview Camp', 'Lakeshore', 'MI', 44.895, -85.986, 4.6, 48, ARRAY['Full Hookups', 'Pet Friendly', 'Dump Station', 'Store'], 'Demo sample: dunes and blue water. Fictional demo data.', '/spots/spot-starry.jpg', true),
('Canoe Bend Campground', 'Northwood', 'MN', 47.902, -91.867, 4.4, 39, ARRAY['Full Hookups', 'Pet Friendly', 'Dump Station', 'Propane'], 'Demo sample: quiet north-woods base. Not a real business.', '/spots/spot-red-rock.jpg', true),
('Riverstone Pads', 'Flatrock', 'MT', 45.661, -110.564, 4.5, 44, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'Demo sample: riverside fishing vibe. Fictional spot for UI only.', '/spots/spot-coast.jpg', true),
('Coppercliff Rest', 'Redstone', 'AZ', 34.863, -111.812, 4.9, 78, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: copper-colored cliffs. Fictional listing.', '/spots/spot-alpine-lake.jpg', true),
('Outer Dune Pads', 'Seagrass', 'NC', 35.943, -75.624, 4.2, 61, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Demo sample: beach-access vibe. Not a real resort or brand.', '/spots/spot-redwoods.jpg', true);

-- Note: The seed parks have verified = true. New user submissions start as verified = false
-- until a moderator marks them verified.

-- 7. (Optional but recommended) Create a trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. RV Mileage Rewards tables
create table if not exists rewards_profiles (
  user_id uuid references auth.users on delete cascade primary key,
  total_miles double precision default 0,
  total_points integer default 0,
  check_in_count integer default 0,
  boondock_count integer default 0,
  updated_at timestamptz default now()
);

create table if not exists rewards_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  location_id text not null,
  location_name text not null,
  check_in_type text not null check (check_in_type in ('campsite', 'boondocking')),
  points_earned integer not null,
  created_at timestamptz default now()
);

create table if not exists rewards_redemptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  reward_id text not null,
  reward_name text not null,
  points_spent integer not null,
  redeemed_at timestamptz default now()
);

alter table rewards_profiles enable row level security;
alter table rewards_checkins enable row level security;
alter table rewards_redemptions enable row level security;

create policy "Users can view their own rewards profile."
  on rewards_profiles for select using (auth.uid() = user_id);

create policy "Users can upsert their own rewards profile."
  on rewards_profiles for insert with check (auth.uid() = user_id);

create policy "Users can update their own rewards profile."
  on rewards_profiles for update using (auth.uid() = user_id);

create policy "Users can view their own check-ins."
  on rewards_checkins for select using (auth.uid() = user_id);

create policy "Users can create their own check-ins."
  on rewards_checkins for insert with check (auth.uid() = user_id);

create policy "Users can view their own redemptions."
  on rewards_redemptions for select using (auth.uid() = user_id);

create policy "Users can create their own redemptions."
  on rewards_redemptions for insert with check (auth.uid() = user_id);

-- 8. Camper membership subscriptions (demo / future Stripe sync)
alter table trips add column if not exists notes text;
alter table trips add column if not exists camper_packs text[];

create table if not exists membership_subscriptions (
  user_id uuid primary key references auth.users on delete cascade,
  plan text not null check (plan in ('campfire', 'weekender', 'road-tripper', 'full-timer')),
  billing_interval text not null default 'monthly' check (billing_interval in ('monthly', 'annual')),
  active boolean default true,
  subscribed_at timestamptz default now(),
  trial_ends_at timestamptz
);

alter table membership_subscriptions enable row level security;

create policy "Users can view their own membership subscription."
  on membership_subscriptions for select using (auth.uid() = user_id);

create policy "Users can manage their own membership subscription."
  on membership_subscriptions for all using (auth.uid() = user_id);

-- Legacy trip planner subscriptions (superseded by membership_subscriptions)
create table if not exists trip_planner_subscriptions (
  user_id uuid primary key references auth.users on delete cascade,
  plan text not null check (plan in ('explorer', 'navigator', 'trailmaster')),
  active boolean default true,
  subscribed_at timestamptz default now()
);

alter table trip_planner_subscriptions enable row level security;

create policy "Users can view their own trip planner subscription."
  on trip_planner_subscriptions for select using (auth.uid() = user_id);

create policy "Users can manage their own trip planner subscription."
  on trip_planner_subscriptions for all using (auth.uid() = user_id);

-- Done! 
-- Next steps:
-- 1. Go to Authentication > Providers and enable Email (or others)
-- 2. Go to Database > Replication and turn on Realtime for parks, trips, trip_parks (optional)
-- 3. Copy your Project URL and anon key to .env.local
-- 4. Restart your Next.js dev server
-- 5. (Optional) Add some test users via the Auth UI in Supabase dashboard