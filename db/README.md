# Database setup (Supabase)

One-time, ~2 minutes.

1. Open your Supabase project → **SQL editor** → **New query**.
2. Open `db/schema.sql` in this repo → copy the whole file → paste into the SQL editor.
3. Click **Run**.

That creates the `users`, `entries`, `custom_foods`, `meals`, `favorites` tables, seeds Olia and Sten as users, and sets permissive RLS so the publishable key can read and write.

## Verify

In the **Table editor**, you should see five tables. The `users` table contains exactly two rows: Olia and Sten.

## Re-running

The script is idempotent — `create table if not exists` and `on conflict do nothing` make it safe to re-run after schema changes.

## Reset (delete everything)

```sql
truncate public.entries, public.favorites cascade;
delete from public.users;
delete from public.custom_foods;
delete from public.meals;
```

Then re-run `schema.sql` to re-seed Olia and Sten.

## Privacy

The publishable key is in the client bundle. Anyone with the deployed URL has read/write to your tables. If that becomes a concern: rotate the key in Supabase → Settings → API, update `src/lib/supabase.ts`, redeploy.
