-- Protein Tracker — Supabase schema
-- Run once in your project's SQL editor (https://supabase.com/dashboard → SQL editor → New query → paste all → Run).

-- ─── 1. Users (a.k.a. profiles, no auth) ───────────────────────────────────
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  weight_kg numeric,
  height_cm numeric,
  age int,
  sex text check (sex in ('female','male','other')),
  weight_unit text check (weight_unit in ('kg','lb')) default 'kg',
  activity_level text check (activity_level in ('sedentary','light','active','very_active')) default 'active',
  goal_type text check (goal_type in ('maintain','lose_fat','build_muscle')) default 'build_muscle',
  goal_override_g int,
  worker_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed the two family accounts (idempotent).
insert into public.users (name) values ('Olia') on conflict (name) do nothing;
insert into public.users (name) values ('Sten') on conflict (name) do nothing;

-- ─── 2. Entries (food log) — per user ──────────────────────────────────────
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date_iso date not null,
  food_id text,
  meal_id uuid,
  custom_name text,
  grams numeric not null,
  protein_g numeric not null,
  source text,
  timestamp_ms bigint not null,
  created_at timestamptz default now()
);
create index if not exists entries_user_date_idx on public.entries (user_id, date_iso);

-- ─── 3. Custom foods (shared across all users) ─────────────────────────────
create table if not exists public.custom_foods (
  id text primary key,
  name text not null,
  protein_per_100g numeric not null,
  category text default 'other',
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- ─── 4. Meals / recipes (shared) ───────────────────────────────────────────
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ingredients jsonb not null,
  servings int not null default 4,
  total_protein_g numeric not null,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- ─── 5. Favorites (per user) ───────────────────────────────────────────────
create table if not exists public.favorites (
  user_id uuid references public.users(id) on delete cascade,
  food_id text not null,
  primary key (user_id, food_id)
);

-- ─── 6. Row-Level Security ─────────────────────────────────────────────────
-- Family app, no real auth. Permissive policies for the anon role
-- (which is what the publishable key uses). The data is effectively
-- "anyone with the URL+key can read/write" — fine for personal use.
alter table public.users        enable row level security;
alter table public.entries      enable row level security;
alter table public.custom_foods enable row level security;
alter table public.meals        enable row level security;
alter table public.favorites    enable row level security;

drop policy if exists "anon all" on public.users;
drop policy if exists "anon all" on public.entries;
drop policy if exists "anon all" on public.custom_foods;
drop policy if exists "anon all" on public.meals;
drop policy if exists "anon all" on public.favorites;

create policy "anon all" on public.users        for all to anon using (true) with check (true);
create policy "anon all" on public.entries      for all to anon using (true) with check (true);
create policy "anon all" on public.custom_foods for all to anon using (true) with check (true);
create policy "anon all" on public.meals        for all to anon using (true) with check (true);
create policy "anon all" on public.favorites    for all to anon using (true) with check (true);

-- ─── 7. updated_at trigger on users ────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_touch on public.users;
create trigger users_touch before update on public.users
for each row execute function public.touch_updated_at();
