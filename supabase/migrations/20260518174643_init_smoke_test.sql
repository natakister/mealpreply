-- Smoke-test table to verify migrations apply cleanly end-to-end.
-- Will be replaced in Plan 2 with real schema.

create table public.app_health (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  status text not null check (status in ('ok', 'degraded'))
);

alter table public.app_health enable row level security;

create policy "anyone can read app_health"
  on public.app_health for select
  using (true);

grant select on public.app_health to anon, authenticated;

insert into public.app_health (status) values ('ok');
