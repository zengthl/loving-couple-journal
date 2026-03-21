# Loving Couple Journal

React 19 + TypeScript + Vite + Supabase couple journal app.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables in `.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start local development:

```bash
npm run dev
```

4. Run the standard verification flow:

```bash
npm run check
```

Local development runs on `http://127.0.0.1:3000/`.

## Project Flow

- `App.tsx` coordinates auth, navigation, and screen-level data flows.
- Main screens live in `screens/`.
- Shared UI lives in `components/`.
- Supabase access and hooks live in `lib/`.
- Database migrations live in `supabase/migrations/`.

## Backend Source Of Truth

Use the migration chain in `supabase/migrations/000-010` as the current database source of truth.

The following files are legacy reference only and should not be used to bootstrap a fresh environment:

- `supabase/schema.sql`
- `SUPABASE_SETUP.md`
- `AUTH_SETUP.md`
- `AUTH_COMPLETE.md`
- `supabase/auth_migration_safe.sql`

## MCP Notes

- The repo contains `.mcp.json` for Supabase tooling.
- Store `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` in your local Codex environment, not in the repo.
- MCP is useful for database operations, but the runtime app only requires valid Supabase environment variables plus a migrated project.
- If MCP is unavailable in your current Codex session, restart Codex after updating your global MCP config.
- You can still run the frontend workflow locally with `npm run dev` and `npm run check` even when MCP is unavailable.
