-- Profile = configurable user state. One row per auth.user. Created on first sign-in.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'en' check (locale in ('en')),  -- v1: en only; extending = add to check
  household_adults int not null default 1 check (household_adults >= 1),
  household_children int not null default 0 check (household_children >= 0),
  diet_tags text[] not null default array[]::text[],            -- e.g. {'vegetarian','no-pork'}
  excluded_ingredients text[] not null default array[]::text[], -- e.g. {'cilantro','olives'}
  goal text not null default 'wellness' check (goal in ('cut','build','maintain','wellness')),
  calorie_target int check (calorie_target is null or calorie_target between 800 and 5000),
  prep_days int[] not null default array[0, 4]::int[],          -- 0=Sun, 4=Thu (default twice-weekly prep)
  equipment text[] not null default array[]::text[],            -- e.g. {'vacuum_sealer','steamer'}
  cooking_effort_level text not null default 'medium'
    check (cooking_effort_level in ('low','medium','high')),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_locale_idx on public.profiles(locale);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
