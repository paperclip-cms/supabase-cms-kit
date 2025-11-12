-- =====================================================================
-- HOSTED FEATURES MIGRATION
-- =====================================================================
-- This migration adds support for project-based multi-tenancy (hosted mode)
-- while maintaining backward compatibility with user-owned collections (OSS mode)
--
-- OSS Mode: Collections are owned by users directly (user_id NOT NULL, project_id NULL)
-- Hosted Mode: Collections are owned by projects (project_id NOT NULL, user_id NULL)
-- =====================================================================

-- =====================================================================
-- 1. PROJECTS TABLE (Hosted Only)
-- =====================================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,

  -- Billing fields
  subscription_id text,
  subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'canceled', 'past_due')),
  subscription_provider text check (subscription_provider in ('polar', 'flowglad', 'stripe')),

  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Trigger to update updated_at
drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 2. PROJECT MEMBERS TABLE (Hosted Only)
-- =====================================================================

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),

  created_at timestamptz not null default now(),

  unique(project_id, user_id)
);

alter table public.project_members enable row level security;

-- Index for fast membership lookups
create index if not exists idx_project_members_user on public.project_members(user_id);
create index if not exists idx_project_members_project on public.project_members(project_id);

-- =====================================================================
-- 3. UPDATE COLLECTIONS TABLE
-- =====================================================================

-- Add ownership columns (both nullable for now)
alter table public.collections add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.collections add column if not exists project_id uuid references public.projects(id) on delete cascade;

-- Add constraint: Must have EITHER user_id OR project_id (not both, not neither)
alter table public.collections add constraint collections_ownership_check
  check (
    (user_id is not null and project_id is null) or
    (user_id is null and project_id is not null)
  );

-- Add indexes for ownership lookups
create index if not exists idx_collections_user on public.collections(user_id);
create index if not exists idx_collections_project on public.collections(project_id);

-- Add timestamps if missing
alter table public.collections add column if not exists created_at timestamptz not null default now();

-- Trigger to update updated_at
drop trigger if exists set_collections_updated_at on public.collections;
create trigger set_collections_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- =====================================================================

-- Drop old permissive policy
drop policy if exists collections_editor_rw on public.collections;

-- OSS Mode: Users can manage their own collections
create policy collections_user_owned_rw on public.collections
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Hosted Mode: Users can manage collections in their projects
create policy collections_project_owned_rw on public.collections
  for all to authenticated
  using (
    project_id in (
      select project_id
      from public.project_members
      where user_id = auth.uid()
    )
  )
  with check (
    project_id in (
      select project_id
      from public.project_members
      where user_id = auth.uid()
    )
  );

-- Projects: Users can view their own projects
create policy projects_member_read on public.projects
  for select to authenticated
  using (
    id in (
      select project_id
      from public.project_members
      where user_id = auth.uid()
    )
  );

-- Projects: Only owners can update projects
create policy projects_owner_update on public.projects
  for update to authenticated
  using (
    id in (
      select project_id
      from public.project_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Projects: Only owners can delete projects
create policy projects_owner_delete on public.projects
  for delete to authenticated
  using (
    id in (
      select project_id
      from public.project_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Project Members: Users can view members of their projects
create policy project_members_read on public.project_members
  for select to authenticated
  using (
    project_id in (
      select project_id
      from public.project_members
      where user_id = auth.uid()
    )
  );

-- Project Members: Only owners/admins can manage members
create policy project_members_manage on public.project_members
  for all to authenticated
  using (
    project_id in (
      select project_id
      from public.project_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- =====================================================================
-- 5. HELPER FUNCTIONS
-- =====================================================================

-- Function to get user's active project (for hosted mode)
-- Returns the first project the user is a member of, or NULL
create or replace function public.get_user_active_project(p_user_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_project_id uuid;
begin
  select project_id into v_project_id
  from public.project_members
  where user_id = p_user_id
  limit 1;

  return v_project_id;
end;
$$;

-- Function to check if user can create collections
-- OSS: Always true
-- Hosted: Must be in a project with active subscription
create or replace function public.can_create_collection(p_user_id uuid, p_project_id uuid default null)
returns boolean
language plpgsql
security definer
as $$
declare
  v_subscription_status text;
begin
  -- If no project_id, assume OSS mode - always allow
  if p_project_id is null then
    return true;
  end if;

  -- Check project subscription status
  select subscription_status into v_subscription_status
  from public.projects
  where id = p_project_id;

  -- Allow if subscription is active or trialing
  return v_subscription_status in ('active', 'trial');
end;
$$;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Note: Existing collections will have NULL user_id and project_id.
-- You'll need to run a data migration to assign user_id to existing collections.
-- See: scripts/migrate-collections-to-user-owned.sql
-- =====================================================================
