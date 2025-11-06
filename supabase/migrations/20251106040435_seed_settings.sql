-- this isn't really a migration, but seeding
-- data this way makes onboarding easier :)
insert into paperclip_settings
  (setting_key, setting_value)
values
  ('telemetry', 'false');
