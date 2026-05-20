-- Optional generator layer (Option C, Phase B): empty in v1.
-- A bowl_template = a "shape" the AI generator can use to compose new bowls by picking
-- one recipe per slot from slot_recipe_candidates. Hand-curated, not auto-populated by ingestion.
-- Empty tables now cost zero migration later when Plan 3 starts using them.

create table public.bowl_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                     -- e.g. 'lunch-classic-bowl', 'breakfast-smoothie'
  meal_type text not null references public.meal_types(slug) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- A template's expected slots. accepted_role_tags advisory-filters which ingredient roles fit a slot.
create table public.template_slots (
  id uuid primary key default gen_random_uuid(),
  bowl_template_id uuid not null references public.bowl_templates(id) on delete cascade,
  slot_key text not null,                        -- 'base','protein','fiber','sauce','topping'
  position int not null,
  is_required boolean not null default true,
  accepted_role_tags text[] not null default array[]::text[],  -- recipe_ingredients.role_tag values
  unique (bowl_template_id, slot_key),
  unique (bowl_template_id, position)
);

create index template_slots_template_idx on public.template_slots(bowl_template_id);

-- Curated whitelist: which recipes the generator may pull into which slot, with optional weight.
-- Note: the generator picks RECIPES (whole dishes), not individual products — Option C.
create table public.slot_recipe_candidates (
  template_slot_id uuid not null references public.template_slots(id) on delete cascade,
  recipe_id        uuid not null references public.recipes(id) on delete cascade,
  weight numeric(4, 2) not null default 1.0 check (weight >= 0),
  primary key (template_slot_id, recipe_id)
);

create index slot_recipe_candidates_recipe_idx on public.slot_recipe_candidates(recipe_id);
