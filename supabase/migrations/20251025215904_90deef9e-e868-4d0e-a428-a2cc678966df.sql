-- Create a dedicated public bucket for profile photos
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- Public read for profile-photos
drop policy if exists "Public read profile photos" on storage.objects;
create policy "Public read profile photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- Allow anyone to upload/update/delete in profile-photos (testing only)
drop policy if exists "Anyone can manage profile photos" on storage.objects;
create policy "Anyone can manage profile photos"
  on storage.objects for all
  using (bucket_id = 'profile-photos')
  with check (bucket_id = 'profile-photos');

-- For recipe saving during testing, relax RLS to allow inserts/updates without auth
-- WARNING: testing only; tighten later with auth
drop policy if exists "Users can create recipes" on public.recipes;
drop policy if exists "Anyone can create recipes (testing)" on public.recipes;
create policy "Anyone can create recipes (testing)"
  on public.recipes for insert
  with check (true);

drop policy if exists "Users can update their own recipes" on public.recipes;
drop policy if exists "Anyone can update recipes (testing)" on public.recipes;
create policy "Anyone can update recipes (testing)"
  on public.recipes for update
  using (true);
