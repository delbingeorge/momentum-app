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
