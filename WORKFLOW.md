# Loving Couple Journal Workflow

## Stack

`React 19 + TypeScript + Vite 6 + Supabase`

## Standard Frontend Flow

1. Read the relevant files before changing behavior.
2. Implement the feature or bug fix.
3. Run the standard verification command:

```bash
npm run check
```

4. If the change affects runtime behavior, smoke test it locally:

```bash
npm run dev
```

5. Commit only after verification passes.
6. Push to `origin/main`.
7. Verify the deployed site after push.

## Database Flow

Use the migration chain in `supabase/migrations/` as the source of truth.

1. Read the latest migrations first.
2. Add the next numbered migration file: `NNN_description.sql`
3. Apply it through Supabase SQL or Supabase MCP.
4. Verify the resulting schema and policies.
5. Re-run `npm run check`.

Do not bootstrap from these legacy files:

- `supabase/schema.sql`
- `supabase/auth_migration_safe.sql`

## Required Environment

Frontend runtime:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Codex MCP runtime:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

## MCP Notes

- Repo-level `.mcp.json` defines the Supabase server command only.
- Secrets must live in the local Codex environment, not in the repository.
- If you change Codex MCP config, restart Codex before expecting the new server to appear.

## Deployment Notes

- Local dev runs on port `3000`.
- Production validation is `npm run check`.
- Standard completion means: local verification, git commit, git push, and a post-push check against the live site.
- After pushing, confirm the latest change is visible on `zthldyq.top` or the active production domain before considering the task done.
