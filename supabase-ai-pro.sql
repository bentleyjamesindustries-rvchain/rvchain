-- Trailhead AI Pro flag on profiles
alter table public.profiles
  add column if not exists ai_pro boolean not null default false;

-- Grant yourself AI Pro (paste user UUID):
-- update public.profiles set ai_pro = true where id = 'YOUR-UUID';
