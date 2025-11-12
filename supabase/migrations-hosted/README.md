# Hosted-Only Migrations

These migrations are **only for the hosted (paid) version** of Paperclip CMS.

**OSS users should NOT run these migrations.**

## What's in here?

- `20251112000000_add_hosted_features.sql` - Creates `projects` and `project_members` tables
- `20251112000001_migrate_existing_collections.sql` - Migrates existing collections to user-owned mode

## When to run these

Only run these if you're deploying the hosted version with `PAPERCLIP_HOSTED=true`.

## How to run

```bash
# From your hosted Supabase instance
npx supabase migration up --file supabase/migrations-hosted/20251112000000_add_hosted_features.sql
npx supabase migration up --file supabase/migrations-hosted/20251112000001_migrate_existing_collections.sql
```

Or manually apply via Supabase SQL Editor.
