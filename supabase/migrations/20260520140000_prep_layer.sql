-- The prep-batch layer. This is MealPreply's USP — "Plan once, prep twice, eat all week."
-- A weekly meal_plan generates one or more prep_sessions (typically on the user's prep_days,
-- e.g. Sunday + Thursday). Each session contains prep_tasks — each task is an instance of a
-- kind='component' recipe (a how-to-cook-grain / how-to-marinate-protein style recipe)
-- producing a storable output product (e.g. "Киноа отварная") with a quantity.
--
-- A meal_plan_item that needs cooked quinoa consumes from a prep_task output via
-- prep_task_consumed_by, enabling "you have 200g cooked quinoa left for tomorrow" logic.

-- Recipes of kind='component' may produce a storable output product. Nullable: regular
-- (kind='meal' or 'side') recipes have no output product on this schema (they're consumed
-- at meal time, not stored).
alter table public.recipes
  add column output_product_id uuid references public.products(id) on delete set null;

create unique index recipes_output_product_id_uniq
  on public.recipes(output_product_id) where output_product_id is not null;

-- One prep session = a scheduled cooking block on a specific date.
create table public.prep_sessions (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  prep_date date not null,
  status text not null default 'planned'
    check (status in ('planned','in_progress','completed','skipped')),
  estimated_minutes int check (estimated_minutes is null or estimated_minutes >= 0),
  actual_minutes int check (actual_minutes is null or actual_minutes >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meal_plan_id, prep_date)
);

create trigger prep_sessions_updated_at
  before update on public.prep_sessions
  for each row execute function public.set_updated_at();

create index prep_sessions_meal_plan_idx on public.prep_sessions(meal_plan_id);

-- One prep task = one checklist line inside a session.
-- Task description is derived from prep_recipe.name via entity_translations (no extra rows).
create table public.prep_tasks (
  id uuid primary key default gen_random_uuid(),
  prep_session_id uuid not null references public.prep_sessions(id) on delete cascade,
  task_order int not null,
  prep_recipe_id uuid references public.recipes(id) on delete restrict,
  output_product_id uuid references public.products(id) on delete restrict,
  output_quantity numeric(8, 2),
  output_unit text check (output_unit is null or output_unit in ('g','ml','piece')),
  estimated_minutes int check (estimated_minutes is null or estimated_minutes >= 0),
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prep_session_id, task_order)
);

create trigger prep_tasks_updated_at
  before update on public.prep_tasks
  for each row execute function public.set_updated_at();

create index prep_tasks_session_idx  on public.prep_tasks(prep_session_id);
create index prep_tasks_recipe_idx   on public.prep_tasks(prep_recipe_id);
create index prep_tasks_product_idx  on public.prep_tasks(output_product_id);

-- Bridge: which meal_plan_items consume from which prep_task batch, and how much.
-- Enables "you have 200g of prepped quinoa remaining for Wednesday" logic.
create table public.prep_task_consumed_by (
  prep_task_id      uuid not null references public.prep_tasks(id) on delete cascade,
  meal_plan_item_id uuid not null references public.meal_plan_items(id) on delete cascade,
  qty_used numeric(8, 2) not null check (qty_used >= 0),
  unit text not null check (unit in ('g','ml','piece')),
  primary key (prep_task_id, meal_plan_item_id)
);

create index prep_task_consumed_by_item_idx on public.prep_task_consumed_by(meal_plan_item_id);

-- RLS — user-owned through the meal_plans → user_id chain.

alter table public.prep_sessions enable row level security;
create policy "prep_sessions_self_read" on public.prep_sessions
  for select using (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );
create policy "prep_sessions_self_insert" on public.prep_sessions
  for insert with check (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );
create policy "prep_sessions_self_update" on public.prep_sessions
  for update using (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );
create policy "prep_sessions_self_delete" on public.prep_sessions
  for delete using (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );

alter table public.prep_tasks enable row level security;
create policy "prep_tasks_self_read" on public.prep_tasks
  for select using (
    exists (select 1 from public.prep_sessions s
            join public.meal_plans p on p.id = s.meal_plan_id
            where s.id = prep_session_id and p.user_id = auth.uid())
  );
create policy "prep_tasks_self_insert" on public.prep_tasks
  for insert with check (
    exists (select 1 from public.prep_sessions s
            join public.meal_plans p on p.id = s.meal_plan_id
            where s.id = prep_session_id and p.user_id = auth.uid())
  );
create policy "prep_tasks_self_update" on public.prep_tasks
  for update using (
    exists (select 1 from public.prep_sessions s
            join public.meal_plans p on p.id = s.meal_plan_id
            where s.id = prep_session_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.prep_sessions s
            join public.meal_plans p on p.id = s.meal_plan_id
            where s.id = prep_session_id and p.user_id = auth.uid())
  );
create policy "prep_tasks_self_delete" on public.prep_tasks
  for delete using (
    exists (select 1 from public.prep_sessions s
            join public.meal_plans p on p.id = s.meal_plan_id
            where s.id = prep_session_id and p.user_id = auth.uid())
  );

alter table public.prep_task_consumed_by enable row level security;
create policy "prep_task_consumed_by_self_select" on public.prep_task_consumed_by
  for select using (
    exists (select 1 from public.prep_tasks t
            join public.prep_sessions s on s.id = t.prep_session_id
            join public.meal_plans p on p.id = s.meal_plan_id
            where t.id = prep_task_id and p.user_id = auth.uid())
  );
create policy "prep_task_consumed_by_self_insert" on public.prep_task_consumed_by
  for insert with check (
    exists (select 1 from public.prep_tasks t
            join public.prep_sessions s on s.id = t.prep_session_id
            join public.meal_plans p on p.id = s.meal_plan_id
            where t.id = prep_task_id and p.user_id = auth.uid())
  );
create policy "prep_task_consumed_by_self_update" on public.prep_task_consumed_by
  for update using (
    exists (select 1 from public.prep_tasks t
            join public.prep_sessions s on s.id = t.prep_session_id
            join public.meal_plans p on p.id = s.meal_plan_id
            where t.id = prep_task_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.prep_tasks t
            join public.prep_sessions s on s.id = t.prep_session_id
            join public.meal_plans p on p.id = s.meal_plan_id
            where t.id = prep_task_id and p.user_id = auth.uid())
  );
create policy "prep_task_consumed_by_self_delete" on public.prep_task_consumed_by
  for delete using (
    exists (select 1 from public.prep_tasks t
            join public.prep_sessions s on s.id = t.prep_session_id
            join public.meal_plans p on p.id = s.meal_plan_id
            where t.id = prep_task_id and p.user_id = auth.uid())
  );

-- GRANTs
grant select, insert, update, delete on public.prep_sessions          to authenticated;
grant select, insert, update, delete on public.prep_tasks             to authenticated;
grant select, insert, update, delete on public.prep_task_consumed_by  to authenticated;

grant all on public.prep_sessions          to service_role;
grant all on public.prep_tasks             to service_role;
grant all on public.prep_task_consumed_by  to service_role;
