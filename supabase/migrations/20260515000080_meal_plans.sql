-- A user's weekly meal-plan. Populated by Plan 3 generator (LLM-driven) or hand-curated.
create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,                 -- always a Sunday in user's locale
  status text not null default 'draft'
    check (status in ('draft','approved','active','archived')),
  strategy_notes text,                           -- captured Plan-3 generator output, audit/debug
  generated_at timestamptz not null default now(),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create trigger meal_plans_updated_at
  before update on public.meal_plans
  for each row execute function public.set_updated_at();

create index meal_plans_user_idx on public.meal_plans(user_id, week_start_date desc);

-- One row per (day, meal_type) slot. recipe_id may be null until user picks from swipe stack.
create table public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),  -- 0=Sun
  meal_type text not null references public.meal_types(slug) on delete restrict,
  recipe_id  uuid references public.recipes(id) on delete set null,
  servings int not null default 2 check (servings >= 1),
  position_in_swipe_stack int not null default 0,
  is_liked boolean,                              -- null=not voted, true/false=thumbs
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meal_plan_id, day_of_week, meal_type)
);

create trigger meal_plan_items_updated_at
  before update on public.meal_plan_items
  for each row execute function public.set_updated_at();

create index meal_plan_items_plan_idx   on public.meal_plan_items(meal_plan_id);
create index meal_plan_items_recipe_idx on public.meal_plan_items(recipe_id);
