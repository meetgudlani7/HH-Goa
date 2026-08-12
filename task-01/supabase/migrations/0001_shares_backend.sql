-- Extends the existing `shares` table (which only has id + created_at
-- today) with the storage-path columns this feature needs, creates the
-- `shares` storage bucket, and locks both down so the anon/client key can
-- only ever INSERT — reads happen via public URLs, deletes happen only via
-- the service-role cleanup Edge Function. Run once in the Supabase SQL
-- editor (or `supabase db push`).

-- 1. Extend the shares table with the storage paths.
alter table public.shares
  add column if not exists front_path text not null,
  add column if not exists back_path text not null;

-- 2. RLS: anon may only INSERT its own row — no select/update/delete.
--    Only the cleanup Edge Function (service_role, which bypasses RLS
--    entirely) ever reads or deletes rows.
alter table public.shares enable row level security;

drop policy if exists "anon can insert shares" on public.shares;
create policy "anon can insert shares"
  on public.shares
  for insert
  to anon
  with check (true);

-- 3. Storage bucket for the temporary front/back images. Public, so
--    SharePage can load them directly via getPublicUrl — objects live only
--    a few minutes (see the cleanup function), an acceptable tradeoff for a
--    novelty artifact image, not a sensitive document.
insert into storage.buckets (id, name, public)
values ('shares', 'shares', true)
on conflict (id) do nothing;

drop policy if exists "anon can upload to shares bucket" on storage.objects;
create policy "anon can upload to shares bucket"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'shares');

-- No anon select/update/delete policy on storage.objects — public-bucket
-- reads work via the public URL regardless of RLS, and only the cleanup
-- function (service_role) ever deletes objects.

-- 4. Required by the scheduled cleanup call (see 0002_schedule_cleanup.sql).
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
