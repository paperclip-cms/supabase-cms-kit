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
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.email ->> 'email');
  return new;
end;
$$;

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
  collection_id uuid not null references collections(id) on delete cascade,
  slug text not null, -- URL-friendly ID, used for API calls
  item_data jsonb not null default '{}'::jsonb,  -- all content lives here
  title text, -- promoted to column for better filtering/sorting
  author uuid not null references auth.users(id), -- auth.uid()
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(collection_id, slug)
);
alter table public.items enable row level security;

create index items_project_published_idx on public.items(published, published_at desc);
create index items_data_gin_idx on items using gin (item_data jsonb_path_ops);
