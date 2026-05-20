-- Row-level security for all v1 tables.
-- Principle:
--   * Content tables (products, recipes, templates, translations, ...) = read-all-authenticated.
--   * User-scoped tables (profiles, meal_plans, meal_plan_items) = each user reads/writes own rows.
--   * Ingestion/audit tables (ingestion_runs, ingestion_raw) = service-role only (RLS on, no policies).
-- service_role bypasses RLS automatically — no explicit policies needed for Kai's ingestion scripts.

-- ===== Phase A: user state =====

alter table public.profiles enable row level security;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.invite_codes enable row level security;
-- Read-only validity check from client; redemption goes through a future RPC.
create policy "invite_codes_authed_read" on public.invite_codes
  for select using (auth.role() = 'authenticated');

-- ===== Phase A: i18n =====

alter table public.entity_translations enable row level security;
create policy "entity_translations_read_all" on public.entity_translations
  for select using (auth.role() = 'authenticated');

alter table public.supported_locales enable row level security;
create policy "supported_locales_read_all" on public.supported_locales
  for select using (auth.role() = 'authenticated');

-- ===== Phase B: meal-types vocabulary =====

alter table public.meal_types enable row level security;
create policy "meal_types_read_all" on public.meal_types
  for select using (auth.role() = 'authenticated');

-- ===== Phase B: products + tags =====

alter table public.products enable row level security;
create policy "products_read_all" on public.products
  for select using (auth.role() = 'authenticated');

alter table public.product_tags enable row level security;
create policy "product_tags_read_all" on public.product_tags
  for select using (auth.role() = 'authenticated');

alter table public.product_tag_assignments enable row level security;
create policy "product_tag_assignments_read_all" on public.product_tag_assignments
  for select using (auth.role() = 'authenticated');

-- ===== Phase B: recipes =====

alter table public.recipes enable row level security;
create policy "recipes_read_all" on public.recipes
  for select using (auth.role() = 'authenticated');

alter table public.recipe_meal_types enable row level security;
create policy "recipe_meal_types_read_all" on public.recipe_meal_types
  for select using (auth.role() = 'authenticated');

alter table public.recipe_ingredients enable row level security;
create policy "recipe_ingredients_read_all" on public.recipe_ingredients
  for select using (auth.role() = 'authenticated');

alter table public.recipe_pairings enable row level security;
create policy "recipe_pairings_read_all" on public.recipe_pairings
  for select using (auth.role() = 'authenticated');

-- ===== Phase B: optional template layer (empty in v1) =====

alter table public.bowl_templates enable row level security;
create policy "bowl_templates_read_all" on public.bowl_templates
  for select using (auth.role() = 'authenticated');

alter table public.template_slots enable row level security;
create policy "template_slots_read_all" on public.template_slots
  for select using (auth.role() = 'authenticated');

alter table public.slot_recipe_candidates enable row level security;
create policy "slot_recipe_candidates_read_all" on public.slot_recipe_candidates
  for select using (auth.role() = 'authenticated');

-- ===== Phase B: user-owned meal plans =====

alter table public.meal_plans enable row level security;
create policy "meal_plans_self_read" on public.meal_plans
  for select using (auth.uid() = user_id);
create policy "meal_plans_self_insert" on public.meal_plans
  for insert with check (auth.uid() = user_id);
create policy "meal_plans_self_update" on public.meal_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meal_plans_self_delete" on public.meal_plans
  for delete using (auth.uid() = user_id);

alter table public.meal_plan_items enable row level security;
create policy "meal_plan_items_self_read" on public.meal_plan_items
  for select using (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );
create policy "meal_plan_items_self_insert" on public.meal_plan_items
  for insert with check (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );
create policy "meal_plan_items_self_update" on public.meal_plan_items
  for update using (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );
create policy "meal_plan_items_self_delete" on public.meal_plan_items
  for delete using (
    exists (select 1 from public.meal_plans p
            where p.id = meal_plan_id and p.user_id = auth.uid())
  );

-- ===== Phase B: ingestion audit (service-role only) =====
-- RLS enabled, NO policies = authenticated users see nothing. service_role bypasses RLS.

alter table public.ingestion_runs enable row level security;
alter table public.ingestion_raw  enable row level security;
