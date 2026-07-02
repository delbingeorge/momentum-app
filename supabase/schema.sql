-- Momentum cloud schema — run in the Supabase SQL editor.
-- Local-first: these tables mirror the on-device stores for paid users.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  goal text,
  level text,
  gender text,
  weight_kg numeric,
  days int,
  split_id text,
  unit text,
  rest_sec int,
  schedule jsonb,
  since_deload int default 0,
  is_paid boolean default false,
  updated_at timestamptz default now()
);

create table if not exists public.workout_sessions (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  ts bigint not null,
  day_key text,
  day_name text,
  duration_sec int,
  volume int,
  total_sets int,
  exercises jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.exercise_history (
  user_id uuid not null references auth.users on delete cascade,
  exercise_name text not null,
  sets jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, exercise_name)
);

create table if not exists public.bodyweight_logs (
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  kg numeric not null,
  updated_at timestamptz default now(),
  primary key (user_id, date)
);

alter table public.profiles enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.exercise_history enable row level security;
alter table public.bodyweight_logs enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own sessions" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own history" on public.exercise_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own bodyweight" on public.bodyweight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Global exercise catalog — reference data, not user data. The app ships a
-- bundled snapshot (shared/lib/program/exercise-catalog.json) and refreshes
-- from this table on launch, so new exercises reach users without an app
-- update. Rows are managed via the dashboard / supabase/seed-exercises.sql;
-- there is intentionally no client write policy. Exercise names are the keys
-- of users' exercise_history rows, so treat names as append-only: add new
-- rows, never rename existing ones.
create table if not exists public.exercises (
  id text primary key,               -- stable slug, e.g. 'barbell-bench-press'
  name text not null unique,
  muscle text not null,
  default_kg numeric,                -- first-session load; dumbbells per hand
  is_barbell boolean not null default false,
  is_dumbbell boolean not null default false,
  is_bodyweight boolean not null default false,
  is_timed boolean not null default false,
  is_compound boolean not null default false,
  bodyweight_load numeric,           -- fraction of bodyweight as resistance
  sort_order int not null,           -- library display order within a muscle
  updated_at timestamptz default now()
);

alter table public.exercises enable row level security;

-- World-readable so the catalog refresh works signed-out too.
create policy "catalog readable by all" on public.exercises
  for select to anon, authenticated using (true);

-- User feedback (bug reports, feature requests, general notes). Open to all:
-- anonymous (free, local-only) users submit via the anon key, signed-in users
-- via authenticated. There is intentionally no read policy, so rows are only
-- visible in the Supabase dashboard / via service_role.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  email text,
  type text not null,            -- 'bug' | 'feature' | 'other'
  message text not null check (char_length(message) between 1 and 2000),
  app_version text,
  platform text,                 -- ios | android
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

-- Anyone may submit. user_id/email are best-effort attribution recorded by the
-- client (a signed-in client's session may not match the persisted auth user,
-- so we don't tie the check to auth.uid()). There's no read policy, so a spoofed
-- user_id can't be used to read anyone's data.
create policy "anyone can submit feedback" on public.feedback
  for insert to anon, authenticated
  with check (true);

-- Entitlement lock. The "own profile" policy lets a user write their own row,
-- which would include is_paid — a client could grant itself premium. is_paid is
-- the entitlement source of truth, so only the RevenueCat webhook (service_role)
-- may set it. This trigger forces every client insert/update of is_paid back to
-- false / its existing value; the service role is exempt.
create or replace function public.protect_is_paid()
  returns trigger
  language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.is_paid := false;
  else
    new.is_paid := old.is_paid;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_is_paid on public.profiles;
create trigger protect_is_paid
  before insert or update on public.profiles
  for each row execute function public.protect_is_paid();

-- Free-tier cloud retention cap. Free users back up only a recent window; the
-- client push filter (features/sync/lib/engine.ts) uploads only in-window rows,
-- and this scheduled prune is the authoritative backstop keyed on the
-- entitlement source of truth (is_paid), so a downgraded or tampered client
-- can't hoard cloud storage. Keep FREE_CLOUD_WEEKS (8) in sync with
-- shared/lib/entitlements.ts — the interval below is 8 * 7 = 56 days.
-- Requires the pg_cron extension (enable it in the Supabase dashboard first).
create extension if not exists pg_cron;

create or replace function public.prune_free_cloud_data()
  returns void
  language sql
  security definer
as $$
  delete from public.workout_sessions s
    using public.profiles p
   where s.user_id = p.id
     and p.is_paid = false
     and s.ts < (extract(epoch from now()) * 1000 - 56 * 86400000)::bigint;

  delete from public.bodyweight_logs b
    using public.profiles p
   where b.user_id = p.id
     and p.is_paid = false
     and b.date < (now() - interval '56 days')::date;
$$;

-- Run daily at 03:00 UTC. Re-running select cron.schedule with the same job
-- name updates the existing schedule rather than creating a duplicate.
select cron.schedule(
  'prune-free-cloud-data',
  '0 3 * * *',
  $$select public.prune_free_cloud_data();$$
);
