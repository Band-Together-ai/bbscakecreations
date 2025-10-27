-- Phase 1A: Security Foundation
-- Create role system with proper security definer functions to avoid RLS recursion

-- 1. Create app_role enum
create type public.app_role as enum ('admin', 'collaborator', 'paid', 'free');

-- 2. Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 3. Security definer functions (prevents RLS recursion)
create or replace function public.get_user_role(_user_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = _user_id
  order by 
    case role
      when 'admin' then 1
      when 'collaborator' then 2
      when 'paid' then 3
      when 'free' then 4
    end
  limit 1;
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = 'admin'
  );
$$;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 4. Trigger to assign 'free' role on signup
create or replace function public.assign_default_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'free');
  return new;
end;
$$;

create trigger on_auth_user_created_assign_role
  after insert on auth.users
  for each row execute procedure public.assign_default_role();

-- 5. RLS policies for user_roles table
create policy "Users can view their own role"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

create policy "Only admins can assign roles"
  on public.user_roles
  for all
  using (public.is_admin(auth.uid()));

-- 6. Update RLS policies for recipes table
drop policy if exists "Anyone can create recipes (testing)" on public.recipes;
drop policy if exists "Anyone can update recipes (testing)" on public.recipes;

create policy "Admins and collabs can create recipes"
  on public.recipes
  for insert
  with check (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'collaborator')
  );

create policy "Admins and collabs can update any recipe"
  on public.recipes
  for update
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'collaborator')
  );

create policy "Admins and collabs can delete any recipe"
  on public.recipes
  for delete
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'collaborator')
  );

create policy "Paid users view full recipes"
  on public.recipes
  for select
  using (
    is_public = true or
    public.has_role(auth.uid(), 'paid') or
    public.has_role(auth.uid(), 'admin') or
    public.has_role(auth.uid(), 'collaborator')
  );

-- 7. Update RLS policies for recipe_photos table
drop policy if exists "Anyone can create recipe photos (testing)" on public.recipe_photos;
drop policy if exists "Anyone can update recipe photos (testing)" on public.recipe_photos;
drop policy if exists "Anyone can delete recipe photos (testing)" on public.recipe_photos;

create policy "Admins and collabs can manage recipe photos"
  on public.recipe_photos
  for all
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'collaborator')
  );

-- 8. Update RLS policies for blog_posts
drop policy if exists "Authors can create posts" on public.blog_posts;
drop policy if exists "Authors can update their posts" on public.blog_posts;
drop policy if exists "Authors can delete their posts" on public.blog_posts;

create policy "Admins and collabs can create blog posts"
  on public.blog_posts
  for insert
  with check (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'collaborator')
  );

create policy "Admins and collabs can update blog posts"
  on public.blog_posts
  for update
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'collaborator')
  );

create policy "Admins and collabs can delete blog posts"
  on public.blog_posts
  for delete
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'collaborator')
  );

-- 9. Update RLS policies for forum_posts
drop policy if exists "Authenticated users can create posts" on public.forum_posts;

create policy "Paid users can create forum posts"
  on public.forum_posts
  for insert
  with check (
    public.has_role(auth.uid(), 'paid') or
    public.has_role(auth.uid(), 'admin') or
    public.has_role(auth.uid(), 'collaborator')
  );

-- 10. Update RLS policies for forum_comments
drop policy if exists "Authenticated users can create comments" on public.forum_comments;

create policy "Paid users can create forum comments"
  on public.forum_comments
  for insert
  with check (
    public.has_role(auth.uid(), 'paid') or
    public.has_role(auth.uid(), 'admin') or
    public.has_role(auth.uid(), 'collaborator')
  );