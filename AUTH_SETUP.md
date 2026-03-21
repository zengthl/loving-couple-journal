# Auth Setup

Authentication is already integrated in the frontend code.

## Runtime Requirements

- Supabase Email auth enabled
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Database migrated through `supabase/migrations/010_support_visit_timeline.sql`

## Current Auth Flow

- `lib/auth.ts` wraps Supabase auth operations.
- `lib/useAuth.ts` exposes session and user state to React.
- `screens/LoginScreen.tsx` and `screens/RegisterScreen.tsx` handle the UI.
- `App.tsx` gates the app based on auth state and guest mode.

## Important Correction

Older docs referenced `supabase/auth_migration.sql`.

That file is not part of the current source of truth.
Use the migration chain in `supabase/migrations/` instead.

## Verification Checklist

1. Register a test user.
2. Log in successfully.
3. Create a timeline, discovery, anniversary, or upload record.
4. Confirm writes succeed only for authenticated users.
5. Log out and confirm the app returns to auth screens.
