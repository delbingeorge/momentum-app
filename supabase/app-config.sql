-- Version-gating config for the in-app update prompt (features/update).
-- One row per platform. The app reads it on launch, compares against the
-- installed native version, and shows the app-update sheet when behind.

create table if not exists public.app_config (
  platform text primary key check (platform in ('ios', 'android')),
  -- newest build live in the store; below this → soft (dismissible) prompt
  latest_version text not null,
  -- oldest build still supported; below this → force (non-dismissible) gate
  min_supported_version text not null,
  updated_at timestamptz not null default now()
);

-- World-readable, like the exercises catalog: the check needs no session.
alter table public.app_config enable row level security;

drop policy if exists "app_config read" on public.app_config;
create policy "app_config read"
  on public.app_config for select
  using (true);
-- No insert/update/delete policy → writable only via the service role
-- (dashboard / server). Bump these rows on each release.

insert into public.app_config (platform, latest_version, min_supported_version)
values
  ('ios', '1.0.0', '1.0.0'),
  ('android', '1.0.0', '1.0.0')
on conflict (platform) do nothing;
