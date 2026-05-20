# MealPreply Data Model

Plan 2 deliverable — the full schema for products, recipes, weekly meal plans, and
prep batches. Implemented across 14 migrations in `supabase/migrations/`. Phase A is
auth+i18n foundation; Phase B is recipes+plans+prep+ingestion-audit.

**Live project:** Supabase `qvzczwongfetibasbwxj`.
**Source of truth:** the SQL migrations themselves. This doc is a navigation guide.

---

## Layered overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  PHASE A (foundation)                                                 │
│                                                                       │
│  auth.users (Supabase-managed)                                        │
│    ↓                                                                  │
│  profiles (user state — diet, household, prep_days, calorie_target)   │
│  invite_codes (gated sign-up codes)                                   │
│                                                                       │
│  entity_translations (translatable strings, polymorphic by entity)    │
│  supported_locales (vocabulary: 'en' seeded; add 'ru', 'pt' later)    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PHASE B — REFERENCE                                                  │
│                                                                       │
│  meal_types (vocab: 'breakfast','lunch','dinner','snack')             │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PHASE B — CATALOG (ingredient warehouse, product-first)              │
│                                                                       │
│  products (every ingredient + every sub-recipe output)                │
│    ├─ category: protein|grain|vegetable|fruit|dairy|fat|spice|        │
│    │            sauce|topping|sweetener|beverage|other                │
│    ├─ kcal/macros per 100g (mostly null in v1 — fill in Studio)       │
│    ├─ storage_days (post-prep shelf life)                             │
│    ├─ recipe_id  → recipes(id)  ← sub-recipe linkage (sauce-as-       │
│    │                              ingredient; nullable)               │
│    └─ created_by_user_id  → auth.users  ← extension point for         │
│                                          user-added products          │
│                                                                       │
│  product_tags + product_tag_assignments                               │
│    (diet/season/prep/equipment/allergen/flavor/cuisine — empty in v1) │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PHASE B — RECIPES (flat-core Option C; see propose_schema.md)        │
│                                                                       │
│  recipes (every dish — bowl, smoothie, sauce, granola, prep)          │
│    ├─ kind: 'meal' | 'side' | 'component'                             │
│    ├─ source_book_slug + source_page + source_pipeline                │
│    ├─ portion_g / total_yield_g / kcal_per_(100g|portion) / macros    │
│    ├─ prep/cook/cool_minutes                                          │
│    ├─ country, storage_text, hero_image_url                           │
│    └─ output_product_id → products(id)  ← only for kind='component'   │
│                                          prep recipes; nullable       │
│                                                                       │
│  recipe_meal_types (many-to-many: recipe ↔ meal_type)                 │
│                                                                       │
│  recipe_ingredients (MANY per recipe, the flat-core of Option C)      │
│    ├─ product_id → products                                           │
│    ├─ amount, unit                                                    │
│    ├─ role_tag: base | protein | fiber | sauce | topping (NULL ok)    │
│    ├─ is_optional                                                     │
│    ├─ alt_for_ingredient_no (self-FK to alt-of relationship)          │
│    └─ note (verbatim parenthetical from source)                       │
│                                                                       │
│  recipe_pairings (sparse: "this bowl pairs with that sauce")          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PHASE B — GENERATOR TEMPLATES (empty in v1; populated by Plan 3)     │
│                                                                       │
│  bowl_templates                                                       │
│    ├─ meal_type → meal_types                                          │
│    └─ name in entity_translations                                     │
│                                                                       │
│  template_slots                                                       │
│    ├─ slot_key (base/protein/fiber/sauce/topping)                     │
│    ├─ accepted_role_tags text[]  ← filter for slot_recipe_candidates  │
│    └─ position                                                        │
│                                                                       │
│  slot_recipe_candidates                                               │
│    └─ (template_slot, recipe, weight) — generator picks among these   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PHASE B — USER PLANS                                                 │
│                                                                       │
│  meal_plans (one row per user × week_start_date)                      │
│    └─ status: draft|approved|active|archived                          │
│                                                                       │
│  meal_plan_items (one per (plan, day_of_week, meal_type))             │
│    ├─ recipe_id → recipes  ← the chosen dish for this slot            │
│    └─ servings, position_in_swipe_stack, is_liked                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PHASE B — PREP LAYER (USP — "Plan once. Prep twice. Eat all week.")  │
│                                                                       │
│  prep_sessions (scheduled cooking block on a date)                    │
│    ├─ meal_plan_id → meal_plans                                       │
│    └─ status: planned|in_progress|completed|skipped                   │
│                                                                       │
│  prep_tasks (one checklist line — make X amount of product Y)         │
│    ├─ prep_recipe_id → recipes  ← the component recipe to follow      │
│    ├─ output_product_id → products  ← what goes in fridge afterwards  │
│    ├─ output_quantity / output_unit                                   │
│    └─ is_completed, completed_at                                      │
│                                                                       │
│  prep_task_consumed_by (bridge: prepped batch ↔ meal slot)            │
│    ├─ prep_task_id, meal_plan_item_id                                 │
│    └─ qty_used, unit                                                  │
│       (lets us answer "how much cooked quinoa is left for Wednesday") │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PHASE B — INGESTION AUDIT                                            │
│                                                                       │
│  ingestion_runs (one row per pipeline invocation)                     │
│    ├─ run_type: pdf_text|pdf_vision|llm_recipe|llm_plan_strategy      │
│    └─ source_label, invoker, summary stats                            │
│                                                                       │
│  ingestion_raw (one row per processed page)                           │
│    ├─ run_id → ingestion_runs                                         │
│    ├─ book_slug, page_no                                              │
│    ├─ raw_json jsonb  ← full LLM output before normalization          │
│    └─ recipe_id → recipes  ← what it became                           │
│                                                                       │
│  Backwards-path: re-derive recipes from raw_json without re-hitting   │
│  the LLM. Cheap re-runs after schema reshapes.                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Why Option C (flat ingredients, not slot-bound) — short version

The original plan proposed `recipe_components(recipe_id, slot_key) PRIMARY KEY` —
one product per slot per recipe. Real bowls have 8-16 ingredients with multiple
items per role (2 proteins, 4 fibers, 2 sauces). That constraint would drop ~70%
of ingredients on ingest.

**Option C** moves the slot semantic from the schema to an advisory `role_tag`
column on `recipe_ingredients`. Schema doesn't enforce one-per-slot; the value
is a hint for UI grouping and generator filtering. Bowls have 16 ingredients,
sauces have null role_tags (no bowl-role taxonomy needed), smoothies same.

Full rationale: see `scripts/pdf_discovery/propose_schema.md` (committed,
approved by Nata 2026-05-19).

---

## i18n model

Every translatable string on every translatable entity lives in `entity_translations`:

| entity_type   | typical fields                       |
|---------------|--------------------------------------|
| product       | name, description                    |
| recipe        | name, subtitle, instructions, tip_text |
| meal_type     | (not used; meal_type slugs are tech-keys) |
| bowl_template | name                                 |
| product_tag   | label                                |

The view `translations_en` exists as a convenience for English-locale flattening
(was set up in Phase A). Add other locales by inserting into `supported_locales`
plus the corresponding `entity_translations` rows — no schema change needed.

---

## RLS posture by table class

| Class | Tables | Anon SELECT | Authed SELECT | Authed write | Service-role |
|---|---|:-:|:-:|:-:|:-:|
| Reference | meal_types, supported_locales | ✓ (meal_types only) | ✓ | ✗ | ✓ |
| Content   | products, recipes, recipe_*, bowl_templates, template_slots, slot_recipe_candidates, entity_translations | ✗ | ✓ | ✗ | ✓ |
| User profile | profiles | ✗ | self only | self only | ✓ |
| Invites | invite_codes | ✗ | ✓ (validity check) | ✗ | ✓ |
| User plans | meal_plans, meal_plan_items | ✗ | self only | self only | ✓ |
| Prep | prep_sessions, prep_tasks, prep_task_consumed_by | ✗ | self only (via meal_plan chain) | self only | ✓ |
| Audit | ingestion_runs, ingestion_raw | ✗ | ✗ | ✗ | ✓ |

Migrations: `20260515000110_rls_policies.sql`, `20260520130000_grants_for_phase_ab.sql`,
`20260520140000_prep_layer.sql`, `20260520150000_meal_types_public.sql`.

---

## How Plan 3 (AI generator) will use this

1. Onboarding: user fills profile (`profiles` row); picks invite code (`invite_codes`).
2. Plan generation: LLM-based generator reads `profiles` + `meal_types` + a filtered
   `recipes` set (by diet tags, excluded products, calorie target) and writes a
   `meal_plans` + 21 `meal_plan_items` rows (7 days × 3 meals).
3. Prep planning: a downstream pass groups `meal_plan_items` by required components,
   picks component recipes (`kind='component'`), and writes `prep_sessions` (1-2 per
   week based on `profiles.prep_days`) with `prep_tasks` for each batch. Links to
   `prep_task_consumed_by`.
4. User runs through the prep checklist; checks off `prep_tasks.is_completed`.
5. Each meal slot: user assembles from prepped components (consumes from
   `prep_task_consumed_by`).

No schema changes needed for any of this — only data writes. The optional template
layer (`bowl_templates / template_slots / slot_recipe_candidates`) is available if
Plan 3 wants enumerative SQL search instead of LLM assembly; it's empty in v1.

---

## Current data state (2026-05-20)

| Table | Rows |
|---|---:|
| recipes | 275 (265 from initial run + 10 prep) |
| products | 567 (554 + 8 cooked-output + 5 raw-extension) |
| recipe_ingredients | 2524 |
| recipe_meal_types | 449 |
| entity_translations | 2362 (567 product + 827 recipe + 968 other locale rows from existing) |
| ingestion_raw | 275 |
| ingestion_runs | 3 |
| meal_plans / meal_plan_items / prep_* | 0 (populated by users + Plan 3) |
| bowl_templates / template_slots / slot_recipe_candidates | 0 (curated later) |

Source: `scripts/ingest/normalize.py` initial + `scripts/ingest/normalize_prep.py`
incremental. All ingestion is reproducible from `ingestion_raw.raw_json` without
hitting Claude.

---

## Files index

- Migrations: `supabase/migrations/2026051500*` (Phase A + Phase B core)
- Migrations: `supabase/migrations/20260520*` (Phase B extensions: user_products,
  grants, prep_layer, meal_types_public)
- Schema decisions: `scripts/pdf_discovery/propose_schema.md`
- PDF discovery + sample script: `scripts/pdf_discovery/analyze_pdf.py`
- Ingestion models: `scripts/ingest/models.py`
- Ingestion entrypoint: `scripts/ingest/prepare_inputs.py` + `normalize.py` + `normalize_prep.py`
- App typed client: `app/src/lib/supabase.ts` + `app/src/types/database.ts`
- Studio workflow guide: `supabase/STUDIO_WORKFLOW.md`
