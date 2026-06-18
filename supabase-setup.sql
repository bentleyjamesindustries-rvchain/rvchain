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
  verification_tx text,
  verification_hash text,
  verification_ots text,
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz default now()
);

-- Migration for existing databases (safe to re-run)
alter table parks add column if not exists verification_hash text;
alter table parks add column if not exists verification_ots text;
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

-- Allow updates for verification (even if not owner, for the "blockchain" action)
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

-- 6. Seed the original 25 parks (verified = true for originals)
-- You can run this after the tables are created.
INSERT INTO parks (name, city, state, lat, lng, rating, price, amenities, description, image, verified) VALUES
('West Yellowstone RV Resort', 'West Yellowstone', 'MT', 44.659, -111.099, 4.6, 55, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Just minutes from Yellowstone''s west entrance. Spacious sites, clean facilities, and incredible wildlife viewing at sunrise.', 'https://picsum.photos/id/1018/800/400', true),
('Zion Canyon Campground & RV Resort', 'Springdale', 'UT', 37.188, -113.004, 4.8, 68, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Stunning red rock views. Walk or shuttle straight into Zion National Park. Great for hikers and photographers.', 'https://picsum.photos/id/1005/800/400', true),
('Grand Canyon Trailer Village', 'Tusayan', 'AZ', 35.973, -112.142, 4.3, 42, ARRAY['Full Hookups', 'Dump Station', 'Pet Friendly', 'Store'], 'The closest full-service RV park to the South Rim. Quiet at night and perfect for early park entry.', 'https://picsum.photos/id/160/800/400', true),
('Lake Powell RV Park', 'Page', 'AZ', 36.912, -111.455, 4.5, 49, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Propane'], 'Beautiful views of Lake Powell. Easy access to boat launches and Antelope Canyon tours.', 'https://picsum.photos/id/251/800/400', true),
('Yosemite South Coast RV Resort', 'Oakhurst', 'CA', 37.328, -119.649, 4.7, 72, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Gateway to Yosemite. Large pull-throughs and excellent stargazing. Great base for day trips into the park.', 'https://picsum.photos/id/1033/800/400', true),
('Morro Bay RV Park & Campground', 'Morro Bay', 'CA', 35.366, -120.849, 4.4, 58, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Dump Station'], 'Right on the coast with incredible ocean and Morro Rock views. Perfect for whale watching season.', 'https://picsum.photos/id/201/800/400', true),
('Redwood Coast RV Resort', 'Crescent City', 'CA', 41.753, -124.195, 4.9, 65, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'Among the tallest trees on Earth. Quiet, clean, and the perfect jumping-off point for exploring the redwoods.', 'https://picsum.photos/id/29/800/400', true),
('Columbia River Gorge RV Park', 'Hood River', 'OR', 45.705, -121.521, 4.6, 52, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Wind sports capital of the world. Incredible gorge views and close to dozens of waterfalls.', 'https://picsum.photos/id/133/800/400', true),
('Mount Rainier RV Resort', 'Ashford', 'WA', 46.756, -121.998, 4.5, 60, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Store'], 'Breathtaking views of Mount Rainier. Close to the Nisqually entrance and Paradise area.', 'https://picsum.photos/id/180/800/400', true),
('Rocky Mountain RV Park', 'Estes Park', 'CO', 40.376, -105.511, 4.7, 75, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Just outside Rocky Mountain National Park. Elk often wander through the property at dawn.', 'https://picsum.photos/id/251/800/400', true),
('Badlands RV Resort', 'Wall', 'SD', 43.992, -102.244, 4.2, 38, ARRAY['Full Hookups', 'Dump Station', 'Pet Friendly', 'Store'], 'Close to Badlands National Park and Wall Drug. Dramatic landscapes and dark skies.', 'https://picsum.photos/id/1005/800/400', true),
('Hill Country RV Resort', 'Kerrville', 'TX', 30.047, -99.145, 4.8, 48, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Beautiful Texas Hill Country. Great for wine tasting and exploring the Guadalupe River.', 'https://picsum.photos/id/160/800/400', true),
('Gulf Coast RV Park', 'Galveston', 'TX', 29.287, -94.797, 4.3, 45, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Pool'], 'Beach access and close to the historic Strand district. Perfect for winter Texans.', 'https://picsum.photos/id/201/800/400', true),
('Big Bend RV Village', 'Terlingua', 'TX', 29.316, -103.615, 4.6, 52, ARRAY['Full Hookups', 'Pet Friendly', 'Dump Station', 'Propane'], 'Dark sky sanctuary next to Big Bend National Park. Incredible stargazing and desert solitude.', 'https://picsum.photos/id/29/800/400', true),
('Everglades RV Resort', 'Homestead', 'FL', 25.462, -80.477, 4.4, 55, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Gateway to Everglades National Park and the Florida Keys. Great birding and airboat tours nearby.', 'https://picsum.photos/id/251/800/400', true),
('Key West RV Resort', 'Key West', 'FL', 24.554, -81.755, 4.1, 82, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'The southernmost RV resort in the continental U.S. Walk to Duval Street and the sunset celebration.', 'https://picsum.photos/id/1005/800/400', true),
('Blue Ridge Mountain RV Park', 'Cherokee', 'NC', 35.486, -83.315, 4.7, 47, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'In the heart of the Great Smoky Mountains. Close to the Blue Ridge Parkway and Cherokee casinos.', 'https://picsum.photos/id/133/800/400', true),
('Great Smoky Mountains RV Resort', 'Pigeon Forge', 'TN', 35.787, -83.554, 4.5, 58, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Perfect base for Dollywood and the national park. Family-friendly with lots of activities.', 'https://picsum.photos/id/180/800/400', true),
('Adirondack RV Park', 'Lake George', 'NY', 43.421, -73.712, 4.3, 52, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'Beautiful mountain lake setting. Boating, hiking, and the famous Lake George village nearby.', 'https://picsum.photos/id/1033/800/400', true),
('Acadia RV Resort', 'Bar Harbor', 'ME', 44.388, -68.203, 4.8, 69, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'], 'Steps from Acadia National Park and the stunning coastline of Maine. Incredible fall colors.', 'https://picsum.photos/id/29/800/400', true),
('Sleeping Bear Dunes RV Park', 'Glen Arbor', 'MI', 44.895, -85.986, 4.6, 48, ARRAY['Full Hookups', 'Pet Friendly', 'Dump Station', 'Store'], 'One of America''s most beautiful places. Turquoise water and massive sand dunes.', 'https://picsum.photos/id/201/800/400', true),
('Boundary Waters RV Campground', 'Ely', 'MN', 47.902, -91.867, 4.4, 39, ARRAY['Full Hookups', 'Pet Friendly', 'Dump Station', 'Propane'], 'True wilderness experience. Launch your canoe into the Boundary Waters from here.', 'https://picsum.photos/id/133/800/400', true),
('Yellowstone River RV Park', 'Livingston', 'MT', 45.661, -110.564, 4.5, 44, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'], 'Excellent fishing and a beautiful setting along the Yellowstone River. Less crowded than West Yellowstone.', 'https://picsum.photos/id/160/800/400', true),
('Sedona Red Rock RV Resort', 'Sedona', 'AZ', 34.863, -111.812, 4.9, 78, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Vortex energy and red rock majesty. Many sites have direct views of Cathedral Rock.', 'https://picsum.photos/id/251/800/400', true),
('Outer Banks RV Resort', 'Nags Head', 'NC', 35.943, -75.624, 4.2, 61, ARRAY['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'], 'Beachfront access on the beautiful Outer Banks. Great for kiteboarding and wild horses.', 'https://picsum.photos/id/1005/800/400', true);

-- Note: The seed parks have verified = true. New user submissions start as verified = false
-- until a moderator verifies them (SHA256 hash + OpenTimestamps on Bitcoin).

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

-- 8. Bitcoin wallet profiles (public address only — never store private keys or seed phrases)
create table if not exists wallet_profiles (
  user_id uuid references auth.users on delete cascade primary key,
  bitcoin_address text not null,
  source text not null check (source in ('created', 'manual', 'coinbase')),
  coinbase_linked boolean default false,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table wallet_profiles enable row level security;

create policy "Users can view their own wallet."
  on wallet_profiles for select using (auth.uid() = user_id);

create policy "Users can insert their own wallet."
  on wallet_profiles for insert with check (auth.uid() = user_id);

create policy "Users can update their own wallet."
  on wallet_profiles for update using (auth.uid() = user_id);

create policy "Users can delete their own wallet."
  on wallet_profiles for delete using (auth.uid() = user_id);

-- Done! 
-- Next steps:
-- 1. Go to Authentication > Providers and enable Email (or others)
-- 2. Go to Database > Replication and turn on Realtime for parks, trips, trip_parks (optional)
-- 3. Copy your Project URL and anon key to .env.local
-- 4. Restart your Next.js dev server
-- 5. (Optional) Add some test users via the Auth UI in Supabase dashboard