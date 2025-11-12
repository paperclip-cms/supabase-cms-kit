-- =====================================================================
-- MIGRATE EXISTING COLLECTIONS TO USER-OWNED (OSS MODE)
-- =====================================================================
-- This migration assigns existing collections (with NULL user_id/project_id)
-- to the user who created the first item in that collection.
--
-- If a collection has no items, it will be assigned to the first user
-- in the system (for simplicity).
-- =====================================================================

do $$
declare
  v_first_user_id uuid;
  v_collection record;
  v_first_item_author uuid;
begin
  -- Get the first user in the system (fallback)
  select id into v_first_user_id
  from auth.users
  order by created_at asc
  limit 1;

  -- Only proceed if we have at least one user
  if v_first_user_id is not null then
    -- Loop through collections with NULL ownership
    for v_collection in
      select id
      from public.collections
      where user_id is null and project_id is null
    loop
      -- Try to find the author of the first item in this collection
      select author into v_first_item_author
      from public.items
      where collection_id = v_collection.id
      order by created_at asc
      limit 1;

      -- Assign collection to item author, or fallback to first user
      update public.collections
      set user_id = coalesce(v_first_item_author, v_first_user_id)
      where id = v_collection.id;

      raise notice 'Assigned collection % to user %',
        v_collection.id,
        coalesce(v_first_item_author, v_first_user_id);
    end loop;
  else
    raise notice 'No users found - skipping collection migration';
  end if;
end;
$$;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- All existing collections should now be owned by users (OSS mode).
-- In hosted mode, collections will be created with project_id instead.
-- =====================================================================
