# Supabase Setup

This project must be initialized from the migration chain in `supabase/migrations/`, not from `supabase/schema.sql`.

## Required Supabase Features

- Email auth enabled
- Postgres schema migrated through `000` to `010`
- Storage bucket `user-images`
- Storage policies from migration `005`

## Frontend Environment

Create `.env.local` with:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Recommended Setup Order

1. Create a Supabase project.
2. Enable Email auth.
3. Apply migrations in order from `supabase/migrations/000_migration_tracking.sql` through `supabase/migrations/010_support_visit_timeline.sql`.
4. Confirm the `user-images` bucket and policies from migration `005`.
5. Start the app with `npm run dev`.
6. Validate with `npm run check`.

## Expected Tables

- `timeline_events`
- `discovery_items`
- `anniversaries`
- `provinces`
- `user_province_visits`
- `schema_migrations`

## Important Notes

- Public read behavior is intentionally enabled by later RLS migrations for guest and shared views.
- Write operations still depend on authenticated users and owner policies.
- If uploads fail, verify migration `005` and the storage bucket first.

## Do Not Use

Do not bootstrap a new environment from:

- `supabase/schema.sql`
- `supabase/seed.sql` without first applying current migrations
- `supabase/auth_migration_safe.sql`
