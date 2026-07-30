-- Run this in Supabase → SQL Editor if listing photo uploads fail.
-- Safe to re-run.

-- Ensure bucket exists and is public
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

-- Drop old policies if present
drop policy if exists "listing_images_public_read" on storage.objects;
drop policy if exists "listing_images_auth_upload" on storage.objects;
drop policy if exists "listing_images_auth_update" on storage.objects;
drop policy if exists "listing_images_auth_delete" on storage.objects;
drop policy if exists "Public read listing-images" on storage.objects;
drop policy if exists "Authenticated upload listing-images" on storage.objects;
drop policy if exists "Authenticated update listing-images" on storage.objects;
drop policy if exists "Authenticated delete listing-images" on storage.objects;

-- Anyone can view/download (needed for public listing photos)
create policy "listing_images_public_read"
on storage.objects for select
using (bucket_id = 'listing-images');

-- Signed-in users can upload
create policy "listing_images_auth_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'listing-images');

-- Signed-in users can update files they own (folder = user id)
create policy "listing_images_auth_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Signed-in users can delete their own files
create policy "listing_images_auth_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
