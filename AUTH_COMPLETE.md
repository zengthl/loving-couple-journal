# Auth Status

The frontend auth integration is complete.

## Implemented Areas

- Supabase auth wrapper in `lib/auth.ts`
- React auth hook in `lib/useAuth.ts`
- Login and registration screens
- Auth-aware app shell in `App.tsx`
- Owner-scoped writes in `lib/db.ts`

## Current Source Of Truth

Use these files when validating auth behavior:

- `lib/auth.ts`
- `lib/useAuth.ts`
- `App.tsx`
- `supabase/migrations/004_add_auth_and_rls.sql`
- `supabase/migrations/006_rls_public_read.sql`
- `supabase/migrations/009_optimize_rls_performance.sql`

## Known Product Choice

The app currently supports a guest and shared reading mode for some data.
That is a deliberate product behavior layered on top of owner-only writes.

## Legacy Note

If you see references to `supabase/auth_migration.sql`, treat them as outdated.
The maintained schema lives in `supabase/migrations/`.
