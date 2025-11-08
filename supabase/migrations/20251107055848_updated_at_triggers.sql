alter table paperclip_settings
add column created_at timestamptz not null default now(),
add column updated_at timestamptz not null default now();

drop trigger if exists set_settings_updated_at on public.paperclip_settings;
create trigger set_settings_updated_at
before update on public.paperclip_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_collections_updated_at on public.collections;
create trigger set_collections_updated_at
before update on public.collections
for each row execute function public.set_updated_at();
