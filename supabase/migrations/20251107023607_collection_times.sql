alter table collections
add column created_at timestamptz not null default now(),
add column updated_at timestamptz not null default now(),
add column icon text;
