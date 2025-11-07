create index if not exists collections_slug_idx
  on public.collections (slug);

create index if not exists items_slug_idx
  on public.items (collection_id, slug);
