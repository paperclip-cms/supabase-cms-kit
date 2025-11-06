create table public.paperclip_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text,
  setting_value text
);
alter table public.paperclip_settings enable row level security;

create policy settings_editor_rw on public.paperclip_settings
for all to authenticated
using (true) with check (true);
