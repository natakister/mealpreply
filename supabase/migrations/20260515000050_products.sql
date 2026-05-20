-- A product is a single ingredient OR a sub-recipe output (e.g. a sauce that is also a recipe).
-- Translatable fields live in entity_translations (entity_type='product', field in {'name','description'}).
-- The recipe_id FK is added in a later migration after the recipes table exists.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                   -- machine key, e.g. 'chicken-breast', 'sauce-tsatsiki'
  category text not null check (category in (
    'protein','grain','vegetable','fruit','dairy','fat','spice',
    'sauce','topping','sweetener','beverage','other'
  )),
  base_unit text not null default 'g' check (base_unit in ('g','ml','piece')),
  kcal_per_100g numeric(7, 2),
  protein_g_per_100g numeric(6, 2),
  carbs_g_per_100g  numeric(6, 2),
  fat_g_per_100g    numeric(6, 2),
  storage_days int,                            -- post-prep shelf life; null = ambient/long-shelf
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index products_category_idx on public.products(category) where is_active;

-- Free-form labels: 'vegetarian','vegan','no-gluten','seasonal-summer','quick-prep'...
-- Translatable label via entity_translations (entity_type='product_tag', field='label').
create table public.product_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tag_type text not null check (tag_type in ('diet','season','prep','equipment','allergen','flavor','cuisine')),
  created_at timestamptz not null default now()
);

create table public.product_tag_assignments (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id     uuid not null references public.product_tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

create index product_tag_assignments_tag_idx on public.product_tag_assignments(tag_id);
