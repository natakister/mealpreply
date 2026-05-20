# Schema Proposal — Recipe Storage for MealPreply

**Status:** Approved by Nata on 2026-05-19. Locks the data shape for Task 4 (Phase B schema), Task 6 (ingestion), and Plan 3 (AI generator).

**Decisions (resolved):**
1. **Option C — Hybrid: flat core + optional template layer** — approved. Rationale: bowls follow a *principle* (база / белок / клетчатка / соус / топпинг) but each role can hold multiple ingredients. The rigid `unique(recipe_id, slot_key)` constraint from Option A would drop data on ~70% of bowls; flat ingredients with advisory `role_tag` is required.
2. **Canonical `role_tag` set** — `base`, `protein`, `fiber`, `sauce`, `topping` (Russian: база, белок, клетчатка, соус, топпинг). Note: `fiber`, not `veggies` — per Nata's terminology, the role is dietary fibre (овощи, зелень, бобовые, etc.), not vegetables specifically. The set is a CHECK constraint on `recipe_ingredients.role_tag`, extensible by future migration. Smoothies/granola/ice-cream/sauces may use `role_tag = null` where the principle doesn't apply.
3. **`materials/` → `.gitignore`** — confirmed already in `.gitignore:35` (committed earlier as `8cabc37`). 5 copyright PDFs stay local-only. No change needed.
4. **Optional template layer (`bowl_templates`, `template_slots`, `slot_recipe_candidates`) — created empty in Task 4 Phase B.** Zero migration cost later when Plan 3 starts curating templates. Ingestion (Task 6) does not touch them.

**Context:** Plan 2 Task 3, after discovery of 5 source PDFs in `materials/`.

---

## What the source material actually looks like

Five recipe books, 318 pages total. One mostly visual, four text-based.

| Book | Pages | Mode | Recipe shape | Maps to meal_type |
|---|---:|---|---|---|
| `book-of-bowls.pdf` | 253 | **image-only** (0 text via pypdf) | Complete bowl: title → photo → 5–9 ingredients → numbered steps → kcal+БЖУ → P.S. tip. Same layout every page. | lunch, dinner |
| `10-smoothies.pdf` | 14 | text | Title → ingredients (with frequent "or X" alts) → numbered steps → kcal+БЖУ | breakfast, snack |
| `12-sauces.pdf` | 14 | text | Title → kcal/100g + portion-kcal → country → ingredients → steps → fishka tip → storage | side (sauce) |
| `sauces-and-rations.pdf` | 14 | text | Sauces + plate rations; same shape as 12-sauces minus the country meta | side, lunch, dinner |
| `granola-icecream-toppings.pdf` | 23 | text | Title → kcal/100g + portion-kcal → yield → 3 time fields (prep/cook/cool) → ingredients → steps | breakfast, snack, component |

**Shared fields across all 5 books** (the union — everything we can store from any of them):
- `name_ru`, optional category/section header
- `servings` or `yield_g`, `portion_g`
- `kcal_per_100g` and/or `kcal_per_portion`
- `protein_g`, `fat_g`, `carb_g` (per 100g — БЖУ)
- `ingredients[]`: name, amount, unit, optional ("по вкусу"), alternates ("или йогурт")
- `steps[]`: ordered numbered text
- `prep_time_min`, `cook_time_min`, optional `cool_time_min`
- `tip_text` (P.S./fishka)
- Source-only: `country` (sauces), `storage_days_text` (sauces)
- Vision-only: `hero_image_url` (bowls; cropped from rendered page)

**Cross-book quirks that shape the design:**
1. **Sauce duality.** A sauce is a standalone recipe AND an ingredient inside a bowl recipe (e.g. "Соус цацики" appears as a recipe in `12-sauces` AND as one of 9 ingredients of "Салат-боул с халуми, хумусом и питой" in `book-of-bowls`). The schema must let one row be both a recipe and a product.
2. **Multi-ingredient slot reality.** Bowls in `book-of-bowls` routinely have 8–9 ingredients. There is no clean 5-slot decomposition: a bowl can have 4 separate veggies + 2 proteins (halloumi + chickpeas) + 1 grain + 2 sauces. A rigid `unique(recipe_id, slot_key)` constraint causes data loss on ingestion.
3. **Image-only book.** book-of-bowls needs a vision-based ingestion pipeline. The other 4 books work with text extraction.
4. **Optional and alternate ingredients.** "Анчоусы – 3-4 шт (по желанию)" and "Кокосовое молоко жидкое - 100-150 мл (или йогурт, или вода+мёд)" — both need to be represented.

---

## Three options, ranked

### Option A — Rigid per-meal-type slots (the plan's working assumption)

```
bowl_templates (id, slug, meal_type)
template_slots (template_id, slot_key, position, required_category, UNIQUE(template_id, slot_key))
recipes (id, bowl_template_id, servings, ...)
recipe_components (recipe_id, slot_key, product_id, quantity, unit, PK(recipe_id, slot_key))  -- one product per slot
products (id, slug, category, kcal, macros, base_unit, ...)
slot_eligibility (template_id, slot_key, product_id, weight)
product_affinity (product_a, product_b, score)
```

**Strengths:**
- Cleanest for an enumerative AI generator: "for slot=protein in lunch-classic, pick a product where eligibility>0, optimize affinity." Cheap SQL, no LLM at plan time.
- Mix-and-match UI is trivial: each slot is a swipe stack of products.
- Aligns with the existing `docs/superpowers/plans/2026-05-14-data-layer.md` Step 2–4 SQL.

**Weaknesses:**
- `PK(recipe_id, slot_key)` blocks multi-ingredient slots. The Halluumi bowl (9 ingredients) and the Salmon-feta bowl (10 ingredients) cannot be ingested without losing 4–5 ingredients each. ~70% of `book-of-bowls` recipes have ingredient counts >5.
- Sauce duality unresolved. A sauce is a `product` (when used inside a bowl) AND a `recipe` (when standalone). Two source-of-truth rows for one logical thing, with macro data that must stay in sync manually.
- Slot keys are a closed enum baked into the schema (`base/protein/veggies/sauce/topping/drizzle`). New cuisines or smoothie/granola taxonomies need migrations.
- Forces a layer of human judgment ("which slot is olive oil — sauce or topping?") onto LLM ingestion. High error rate.

### Option B — Flat recipes + ingredients (cookbook industry-standard)

```
recipes (id, slug, name_ru/en, meal_types[], servings, portion_g, yield_g,
         kcal_per_100g, kcal_per_portion, protein_g, fat_g, carb_g,
         prep_min, cook_min, cool_min, tip_text, source_book_slug, source_page,
         hero_image_url, is_active)
recipe_steps (recipe_id, n, body)
recipe_ingredients (recipe_id, ingredient_no, product_id, amount, unit,
                    role_tag, optional, alt_for_ingredient_no)
recipe_pairings (recipe_id, paired_recipe_id, role)  -- e.g. bowl + sauce
products (id, slug, name_ru/en, category, default_unit,
          kcal_per_100g, macros..., is_recipe_ref?)
```

A `product` is anything purchasable raw OR a sub-recipe output (sauce, granola). When a sauce is an ingredient inside a bowl, we reference it by `product_id` of the sauce-product, AND we set `recipe_pairings` so the UI can render "make this sauce → use in this bowl." The sauce-product row carries the macro denormalization; the sauce-recipe row carries instructions.

**Strengths:**
- Maps 1:1 to every source recipe — no data loss on ingestion.
- Sauce duality solved cleanly: one sauce = one `recipes` row + one `products` row linked by `products.recipe_id` (or vice versa).
- `role_tag` (base/protein/veggie/sauce/topping/liquid/garnish/spice — free string) is *advisory*, not structural. LLM tags it during ingestion; downstream consumers (generator, UI) use it for grouping and ranking but the schema doesn't enforce it.
- Optional and alternate ingredients work natively (`optional bool`, `alt_for_ingredient_no` self-FK).

**Weaknesses:**
- Generator in Plan 3 can't do pure SQL enumeration. To compose a new "lunch bowl," it needs to: (a) pick a bowl template / pattern, or (b) call an LLM to assemble. Higher cost per plan generation.
- Mix-and-match UI is less trivial — slots aren't predeclared. The swipe stack needs LLM or hand-curation to assemble per-slot candidates.
- We lose the `slot_eligibility` × `product_affinity` analytical surface that the plan banked on for Plan 3.

### Option C — **Hybrid: flat core + optional template layer** (recommended)

The storage core is Option B (flat). On top of it, we add an OPTIONAL `bowl_templates` + `template_slots` + `slot_recipe_candidates` layer that is **not** required for ingestion. Templates are hand-curated post-ingestion when Plan 3's generator needs enumerative search.

```
-- Core (Phase B, used by Task 6 ingestion):
products              -- raw ingredients + sub-recipe outputs (sauces, granola)
recipes               -- every source recipe, 1 row per page (bowls, smoothies, sauces, granola, ice-cream)
recipe_steps          -- ordered cooking steps
recipe_ingredients    -- many per recipe, with role_tag + optional + alt_for
recipe_pairings       -- "this bowl is designed to be eaten with this sauce" (sparse)

-- Optional generator layer (added later in Phase B or deferred to Plan 3):
bowl_templates        -- skeleton: 'lunch-classic', meal_type, slots[]
template_slots        -- slot_key, position, required, accepted_role_tags[]
slot_recipe_candidates -- (slot_id, recipe_id, weight) — curated whitelist for generator

-- Audit (Phase B, used by Task 6):
ingestion_runs        -- per pipeline-run audit row
ingestion_raw         -- jsonb per (book, page): the raw LLM output before normalization

-- Plan / user-facing (Phase B, used by Plan 3):
meal_plans            -- weekly plan per user
meal_plan_items       -- day_of_week × meal_type → recipe_id (FK to recipes)
```

`meal_plan_items.recipe_id` references a `recipes` row directly. Templates are a generation-time concept; nothing in storage *requires* them.

**Strengths:**
- Ingestion (Task 6) is unblocked: all 5 books fit the flat core with zero data loss.
- Generator-friendly when needed: the optional template layer lets Plan 3 do SQL enumeration AFTER we've curated a handful of templates by hand, on top of an already-populated recipe library.
- Sauce duality solved exactly as in Option B.
- Vision pipeline output (book-of-bowls) and text pipeline output (other 4) land in the same shape.
- Future-extensible: smoothies and granola get `meal_types=['breakfast','snack']`, no schema change. New cuisines = new recipes, not new schema.

**Weaknesses:**
- Slightly more tables than Option A (but ~the same as already implied by Plan 2 Task 4: products, bowl_templates, template_slots, recipes, recipe_components, slot_eligibility, product_affinity, ingestion_runs = 8 tables vs. Option C's 9 core+optional).
- Generator design is deferred: Plan 3 must choose between LLM-assembly, template-curated enumeration, or hybrid. That's the price of not forcing a generator model now while we don't yet know what works.

**Side-by-side decision matrix:**

| Criterion | Option A | Option B | Option C |
|---|:-:|:-:|:-:|
| Ingestion preserves source data | ✗ (slot collapse) | ✓ | ✓ |
| Sauce duality clean | ✗ | ✓ | ✓ |
| Optional/alt ingredients native | partial | ✓ | ✓ |
| Generator can use pure SQL | ✓ | ✗ | ✓ (when templates curated) |
| Mix-and-match UI without LLM | ✓ | ✗ | ✓ (when templates curated) |
| Future cuisines/meal_types | ✗ migration | ✓ | ✓ |
| Tables added in Phase B | 8 | 6 | 6 core + 3 optional |

---

## Recommendation: **Option C**

**Why:** The data we have today does not fit Option A without loss. Option B alone defers generator design too far. Option C is the cheapest path that doesn't lock us out of Plan 3's enumerative generator while letting Task 6 ingestion succeed on day one.

**Concretely, Task 4 should be amended to:**
1. Drop `recipe_components` (the per-slot single-product binding). Replace with `recipe_ingredients` (many per recipe, with `role_tag` advisory string + `optional` + `alt_for_ingredient_no`).
2. Add `recipe_steps` (numbered cooking steps as separate rows).
3. Add `recipe_pairings` (sparse table for designed bowl+sauce combos).
4. Expand `recipes` with the full nutritional + timing + source-traceability column set (see Option C schema sketch above).
5. Keep `bowl_templates`, `template_slots`, `slot_eligibility`, `product_affinity` — but **rename and reshape** the last two: instead of `(template_id, slot_key, product_id)`, use `slot_recipe_candidates(template_id, slot_id, recipe_id, weight)` because the generator picks among *recipes* (whole dishes), not products. Affinity becomes `recipe_affinity` if Plan 3 needs it; defer the table until then.
6. Add `ingestion_raw` (jsonb per page) alongside `ingestion_runs`. The plan's `ingestion_runs.output_json` is a single jsonb blob per run — fine for audit, but a `(book_slug, page_no, raw_json)` table makes re-derivation cheap when we tweak the schema downstream.

The plan's `meal_plans` and `meal_plan_items` stay as-is.

---

## How the dual ingestion pipeline (Task 6) fits

Task 6 builds **two pipelines, one normalizer**, all writing to the same Option C tables.

**Pipeline 1 — Text (4 books, ~65 pages total):**
1. `pypdf` extracts text per page (already proven to work on these 4 in Task 3a discovery).
2. Pre-segment by heuristic page boundaries (one recipe per page for sauces/smoothies/granola; the discovery report's `sample_recipe_pages` confirms this).
3. Send page text + book context to Claude (Sonnet, with a Pydantic schema as `tool_use`). Returns a `RawRecipe` dict.
4. Persist raw output to `ingestion_raw`, then normalize into `recipes` / `recipe_ingredients` / `recipe_steps` / `products` (with fuzzy-match on `products.slug` to deduplicate ingredients across recipes).

**Pipeline 2 — Vision (book-of-bowls, ~225 recipe pages after skipping cover/intro/section-dividers):**
1. `pdftoppm` renders each page to ~1100 px PNG (visual verification done in Task 3b — layout is highly regular and legible at this resolution).
2. Heuristic skip list: cover, table-of-contents, calorie-formula intro pages, "press here to return to menu" section dividers (≈28 pages skipped, detected by presence of large body-text-only regions and absence of a hero photo + ingredient panel).
3. Send page PNG + book context to Claude (Sonnet, vision) with the same Pydantic schema → returns the same `RawRecipe` dict.
4. Persist + normalize into the same tables. The hero photo is extracted by cropping the rendered PNG (left-half region per the observed layout) and uploaded to Supabase Storage; URL goes into `recipes.hero_image_url`.

**Shared normalizer:**
- One `RawRecipe` Pydantic model for both pipelines (identical shape — vision returns the same JSON as text).
- One product-deduplication step (fuzzy match on canonical Russian noun forms; LLM-assisted slugification for new products).
- One audit-row write per page to `ingestion_runs`.

This means the schema is pipeline-agnostic: a downstream consumer cannot tell whether a recipe came from text or vision.

---

## Backwards path if Option C doesn't hold

If during Task 6 ingestion the flat shape proves wrong (e.g. recipes have nested sub-recipes deeper than 1 level, or BЖУ varies per portion in ways that can't be normalized to per-100g), we have three escape hatches:

1. **`ingestion_raw` is source-of-truth.** Every LLM output is persisted as jsonb before normalization. We can re-derive `recipes` / `recipe_ingredients` from `ingestion_raw` without re-hitting Claude (zero cost re-runs).
2. **Schema mutations are additive.** Adding a `recipe_steps.parent_step_id` for nested instructions, or a `recipe_ingredients.sub_recipe_id` for nested sub-recipes, doesn't break existing rows — both are nullable.
3. **Worst case — fall back to Option B-minus.** Drop `bowl_templates` / `template_slots` / `slot_recipe_candidates`. Storage stays purely flat. Plan 3's generator becomes LLM-driven (assemble plan in one Claude call). This is a stable fallback, not a rewrite.

---

## Decision log (resolved 2026-05-19)

| Question | Decision |
|---|---|
| Approve Option C? | ✓ Yes |
| Canonical role_tag values? | `base`, `protein`, `fiber`, `sauce`, `topping` |
| `materials/` in `.gitignore`? | ✓ Already in place (commit 8cabc37) |
| Optional template layer in Phase B Task 4? | ✓ Yes — empty tables now, populated later |
