drop policy if exists items_public_read on public.items;
create policy items_public_read on public.items
for select to anon using (published_at is not null);

alter table items
drop column published;
