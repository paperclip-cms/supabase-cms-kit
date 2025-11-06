-- create "profiles" table as a lightweight mirror from auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  email text,
  primary key (id)
);
alter table public.profiles enable row level security;

-- auto-add new records to profiles table on sign-up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, email)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- create collections table, e.g. "blog posts", "changelog", "announcements"
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  label text not null,
  config jsonb not null, -- dynamic field definitions
  unique(slug)
);
alter table public.collections enable row level security;

-- collection items, e.g. individual posts or updates
create table public.items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  slug text not null,
  item_data jsonb not null default '{}'::jsonb,

  title text,
  author uuid not null references auth.users(id),
  date timestamptz,
  tags text[] not null default '{}'::text[],
  cover text,

  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(collection_id, slug)
);
alter table public.items enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists set_items_updated_at on public.items;
create trigger set_items_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create index if not exists items_pub_idx
  on public.items (collection_id, published, published_at desc);

create index if not exists items_date_idx
  on public.items (collection_id, date desc);

create index if not exists items_tags_gin_idx
  on public.items using gin (tags);

create index if not exists items_data_gin_idx
  on public.items using gin (item_data jsonb_path_ops);

create policy collections_editor_rw on public.collections
for all to authenticated
using (true) with check (true);

create policy items_editor_rw on public.items
for all to authenticated
using (true) with check (true);

create policy items_public_read on public.items
for select to anon using (published = true);

create policy profiles_self on public.profiles
for select using (auth.uid() = id);

create policy profiles_self_write on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);
