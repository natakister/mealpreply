# Studio Workflow — MealPreply

How to inspect, clean, and extend the database via Supabase Studio.

**Project:** `qvzczwongfetibasbwxj`
**Studio URL:** https://supabase.com/dashboard/project/qvzczwongfetibasbwxj/editor

---

## Sections in Studio (left sidebar)

- **Table Editor** — spreadsheet-style view of every table. Click a row, edit a cell, save. Use Filters for narrowing, Sort for ordering. Foreign-key cells show a "View record" lookup.
- **SQL Editor** — write/run any SQL. Templates dropdown saves frequently-used queries.
- **Database → Schema Visualizer** — auto-generated ERD (Foreign-Key wiring).
- **Database → Policies** — see + edit Row-Level Security policies per table.
- **Authentication → Users** — when you onboard a user, this is where they appear.

---

## Common cleanup tasks after PDF ingestion

The ingestion pipeline produces high-quality recipe rows but ~2% of products land with imperfect data. These are the typical fixes.

### 1. Fix products that ended up in `category='other'`

The auto-classifier maps ingredient names to categories using a substring dictionary. Names it can't recognise default to `other`. Around 10 products out of ~560 sit here.

```sql
-- Find them
select p.id, p.slug,
       (select value from entity_translations
        where entity_type = 'product' and entity_id = p.id
          and locale = 'ru' and field = 'name') as name_ru
from products p
where p.category = 'other'
order by name_ru;
```

For each row decide a real category (`protein`, `grain`, `vegetable`, `fruit`, `dairy`, `fat`, `spice`, `sauce`, `topping`, `sweetener`, `beverage`) and fix in Table Editor or:

```sql
update products set category = 'protein' where slug = '<the-slug>';
```

### 2. Split "X или Y" ingredients into proper alt rows

Some subagents kept "Шампиньоны или вёшенки" as a single product. The data model supports alternates (`alt_for_ingredient_no`) but the dedup created one combined product. To split:

```sql
-- 1. Find offending products
select p.id, p.slug, t.value as name_ru
from products p
join entity_translations t on t.entity_id = p.id and t.entity_type = 'product'
where t.locale = 'ru' and t.value ilike '%или%';
```

Then for each:
1. Update the original product's name to just the primary (e.g. "Шампиньоны").
2. Create the alternate as a new product (e.g. "Вёшенки").
3. In recipe_ingredients rows that reference the old combined product, add a sibling row with the alt product and `alt_for_ingredient_no` pointing at the primary's `ingredient_no`.

Realistically this is 5-15 rows. Easier to do in SQL than UI:

```sql
-- Example: split "огурец и помидор" inside recipe X
-- Already done; this is a template
begin;
  -- 1. rename original
  update entity_translations
    set value = 'Огурец'
    where entity_type = 'product' and entity_id = '<combined-product-id>' and field = 'name' and locale = 'ru';

  -- 2. insert new alt product
  insert into products (slug, category, base_unit) values ('pomidor', 'vegetable', 'g') returning id;
  -- (use returned id below as <new-id>)
  insert into entity_translations (entity_type, entity_id, field, locale, value)
    values ('product', '<new-id>', 'name', 'ru', 'Помидор');

  -- 3. duplicate recipe_ingredient row, swap product_id, set alt_for
  -- (manual based on actual recipe rows; use Table Editor for this part)
commit;
```

### 3. Add a missing product (e.g. ginger, philadelphia cheese, balsamic)

Catalog products have `created_by_user_id IS NULL`. Add via Table Editor → `products` → "Insert row":
- `slug`: kebab-case, transliterated (e.g. `imbir`, `filadelfiia`, `balzamicheskii-uksus`)
- `category`: pick the right one
- `base_unit`: usually `g`
- leave `recipe_id` and `created_by_user_id` null

Then add a Russian name in `entity_translations`:
```sql
insert into entity_translations (entity_type, entity_id, field, locale, value)
  values ('product', '<new-product-id>', 'name', 'ru', 'Имбирь');
```

---

## Useful queries

### How many recipes per source book?
```sql
select source_book_slug, count(*)
from recipes
group by source_book_slug
order by 2 desc;
```

### Recipes that use a specific product (e.g. by name)
```sql
select r.slug, r.kcal_per_portion,
       (select value from entity_translations
        where entity_type='recipe' and entity_id=r.id and field='name' and locale='ru') as name_ru
from recipes r
join recipe_ingredients ri on ri.recipe_id = r.id
join products p on p.id = ri.product_id
join entity_translations t on t.entity_id = p.id and t.entity_type='product' and t.field='name' and t.locale='ru'
where t.value ilike '%халуми%'
order by name_ru;
```

### All prep recipes and their outputs
```sql
select
  (select value from entity_translations
   where entity_type='recipe' and entity_id=r.id and field='name' and locale='ru') as recipe_name,
  (select value from entity_translations
   where entity_type='product' and entity_id=r.output_product_id and field='name' and locale='ru') as output_name,
  r.cook_minutes
from recipes r
where r.kind = 'component' and r.output_product_id is not null
order by recipe_name;
```

### Top-10 most-used products across all recipes
```sql
select p.slug, t.value as name_ru, count(*) as used_in
from recipe_ingredients ri
join products p on p.id = ri.product_id
join entity_translations t on t.entity_id = p.id and t.entity_type='product' and t.field='name' and t.locale='ru'
group by p.slug, t.value
order by used_in desc
limit 10;
```

### Find a recipe by Russian title keyword
```sql
select r.id, r.slug, r.source_page, t.value
from recipes r
join entity_translations t on t.entity_id = r.id and t.entity_type='recipe' and t.field='name' and t.locale='ru'
where t.value ilike '%лосось%'
order by r.source_book_slug, r.source_page;
```

### A recipe's full hydrated view (name, ingredients, steps)
```sql
with the_recipe as (select * from recipes where slug = 'book-of-bowls-p060-salat-boul')
select
  (select value from entity_translations where entity_id = the_recipe.id and field='name' and locale='ru'),
  (select value from entity_translations where entity_id = the_recipe.id and field='instructions' and locale='ru'),
  json_agg(json_build_object(
    'no', ri.ingredient_no,
    'product', (select value from entity_translations where entity_id = p.id and field='name' and locale='ru'),
    'amount', ri.amount,
    'unit', ri.unit,
    'role', ri.role_tag,
    'note', ri.note
  ) order by ri.ingredient_no) as ingredients
from the_recipe
join recipe_ingredients ri on ri.recipe_id = the_recipe.id
join products p on p.id = ri.product_id
group by the_recipe.id;
```

---

## Re-running ingestion

The raw LLM output for every recipe is stored in `ingestion_raw` as jsonb. If you want to re-derive recipes from raw data (e.g. after a schema reshape), don't re-hit the source PDFs — operate on `ingestion_raw` directly.

```sql
-- Sample the raw extraction for a specific recipe page
select raw_json
from ingestion_raw
where book_slug = 'book-of-bowls' and page_no = 60;
```

If you need to fully re-ingest from PDFs (e.g. new books added):
```bash
# from repo root
python scripts/ingest/prepare_inputs.py
# then dispatch subagents (see scripts/ingest/normalize.py prologue)
set -a; source scripts/.venv/.env; set +a
python scripts/ingest/normalize.py
```

---

## Safety rules

- **service_role bypasses RLS.** Studio operates as the project owner. Anything you do here is unrestricted. Be careful with `delete from` and `update without where`.
- **Migration files are the source of truth.** Schema changes made via Studio's table-editor "Add column" UI do NOT generate migration files. If you change schema, write a migration in `supabase/migrations/` instead.
- **Data fixes are fine in Studio** — they don't need a migration. Migrations are for schema. Data inserts/updates from cleanup work belong in the live DB only.
