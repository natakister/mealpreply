-- Phase B Option C — the flat recipe core.
-- One row per source-PDF recipe. Translatable fields live in entity_translations
-- (entity_type='recipe', field in {'name','instructions','tip_text','subtitle'}).
-- The hero photo (for vision-ingested bowls) is referenced by URL into Supabase Storage.

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                     -- machine key, e.g. 'salmon-feta-salat-bowl'
  kind text not null check (kind in ('meal','side','component')),
  -- 'meal' = stand-alone dish (bowl, smoothie, granola, ice-cream); 'side' = sauce, dressing;
  -- 'component' = standalone reusable building block (topping, base mix).
  servings int not null default 2 check (servings >= 1),
  portion_g numeric(7, 2),                       -- single-portion weight; null if not specified in source
  total_yield_g numeric(8, 2),                   -- total output weight (e.g. granola 340g)
  kcal_per_100g       numeric(7, 2),
  kcal_per_portion    numeric(7, 2),
  protein_g_per_100g  numeric(6, 2),
  carbs_g_per_100g    numeric(6, 2),
  fat_g_per_100g      numeric(6, 2),
  prep_minutes int check (prep_minutes is null or prep_minutes >= 0),
  cook_minutes int check (cook_minutes is null or cook_minutes >= 0),
  cool_minutes int check (cool_minutes is null or cool_minutes >= 0),
  country text,                                  -- optional, e.g. 'Italy','Georgia' (12-sauces book)
  storage_text text,                             -- raw source-storage hint, e.g. "5 дней в холодильнике"
  hero_image_url text,                           -- Supabase Storage URL; populated by vision pipeline
  source_book_slug text not null,                -- 'book-of-bowls' | '10-smoothies' | '12-sauces' | ...
  source_page int check (source_page is null or source_page >= 1),
  source_pipeline text not null check (source_pipeline in ('text','vision','manual')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create index recipes_kind_idx        on public.recipes(kind) where is_active;
create index recipes_source_book_idx on public.recipes(source_book_slug);

-- Many-to-many: a recipe can serve multiple meal_types
-- (e.g. a smoothie tagged both 'breakfast' and 'snack').
create table public.recipe_meal_types (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  meal_type text not null references public.meal_types(slug) on delete restrict,
  primary key (recipe_id, meal_type)
);

create index recipe_meal_types_meal_idx on public.recipe_meal_types(meal_type);

-- One row per ingredient in a recipe. Many per recipe; the rigid one-product-per-slot
-- constraint from the original plan is removed (Option C, approved 2026-05-19).
-- role_tag is advisory — populated for bowl recipes only, null otherwise.
create table public.recipe_ingredients (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_no int not null check (ingredient_no >= 1),
  product_id uuid not null references public.products(id) on delete restrict,
  amount numeric(8, 2),                          -- nullable: "по вкусу" / "to taste"
  unit text check (unit in ('g','ml','piece','tsp','tbsp','cup','pinch')),
  role_tag text check (role_tag is null or role_tag in (
    'base','protein','fiber','sauce','topping'
  )),
  is_optional boolean not null default false,
  alt_for_ingredient_no int,                     -- nullable; points to the ingredient this one substitutes
  note text,                                     -- e.g. '(или йогурт)' kept verbatim from source
  primary key (recipe_id, ingredient_no),
  foreign key (recipe_id, alt_for_ingredient_no)
    references public.recipe_ingredients(recipe_id, ingredient_no) on delete set null
);

create index recipe_ingredients_product_idx on public.recipe_ingredients(product_id);
create index recipe_ingredients_role_idx    on public.recipe_ingredients(recipe_id, role_tag);

-- Designed pairings: "this bowl is meant to be eaten with that sauce".
-- Sparse — only populated when the source book explicitly couples a bowl to a sauce.
-- One-way: A pairs with B does NOT imply B pairs with A (a sauce can pair with many bowls).
create table public.recipe_pairings (
  recipe_id        uuid not null references public.recipes(id) on delete cascade,
  paired_recipe_id uuid not null references public.recipes(id) on delete cascade,
  role text not null check (role in ('sauce','side','topping','drink')),
  note text,
  primary key (recipe_id, paired_recipe_id),
  check (recipe_id <> paired_recipe_id)
);

create index recipe_pairings_paired_idx on public.recipe_pairings(paired_recipe_id);

-- Now that recipes exists, link products → recipes for sub-recipe products.
-- A product that IS a recipe-output (sauce, granola) carries a recipe_id pointer.
-- Nullable: most products (raw ingredients) have recipe_id = null.
alter table public.products
  add column recipe_id uuid references public.recipes(id) on delete set null;

create unique index products_recipe_id_uniq on public.products(recipe_id)
  where recipe_id is not null;
