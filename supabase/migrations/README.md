# Supabase Migrations

## Migration Order

| # | File | Description | Depends On |
|---|------|-------------|------------|
| 000 | `000_migration_tracking.sql` | Create tracking table (run ONCE first) | none |
| 001 | `001_create_base_tables.sql` | Create 4 base tables + indexes | none |
| 002 | `002_seed_provinces.sql` | Seed 34 Chinese regions | 001 |
| 003 | `003_seed_sample_anniversary.sql` | Sample anniversary data | 001 |
| 004 | `004_add_auth_and_rls.sql` | Add user_id columns, RLS, policies | 001, 002 |
| 005 | `005_setup_storage.sql` | Storage bucket + RLS policies | none |
| 006 | `006_rls_public_read.sql` | Change SELECT to public access | 004 |
| 007 | `007_add_city_column.sql` | Add city column to visits | 004 |
| 008 | `008_support_multi_city.sql` | UUID PK + unique constraint | 007 |

## How to Apply a New Migration

1. Create a new file: `NNN_description.sql`
2. Run the SQL in Supabase SQL Editor
3. Record it in the tracking table:
   ```sql
   INSERT INTO schema_migrations (version, name, notes) VALUES ('NNN', 'description', 'notes');
   ```
4. Commit the file to git

## How to Check Applied Migrations

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

## For New Developers

To set up the database from scratch, run migrations 000-008 in order via Supabase SQL Editor.
