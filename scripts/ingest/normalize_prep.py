"""Incremental normalizer for prep-component recipes (book-of-bowls pp 241-250).

These pages were initially skipped by the main ingestion pass (treated as method-only
reference). After the prep_layer migration (recipes.output_product_id + prep_sessions/
prep_tasks/prep_task_consumed_by tables), we re-ingest them as kind='component' recipes
that PRODUCE a storable output product (e.g. "Рис отварной" / "Гречка отварная").

This script appends to the existing populated DB:
  - Inserts 10 new prep recipes
  - Inserts 10 new output products ("X отварной/варёный") with category=grain|protein
  - Reuses existing products by slug for the raw ingredients (Рис сухой, Вода, Соль ...)
  - Links recipes.output_product_id → the new output product
  - Inserts ingestion_raw + recipe/product translations
  - Logs a new ingestion_runs row of type 'pdf_vision'

Run:
    set -a; source scripts/.venv/.env; set +a
    python scripts/ingest/normalize_prep.py
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from slugify import slugify
from supabase import Client, create_client


INPUT_DIR = Path("/tmp/ingest-full/book-of-bowls")
PREP_PAGES = list(range(241, 251))  # 241..250

# Hard-coded output-product category mapping (grains vs legumes).
# These 10 prep recipes produce 10 specific outputs; cleanest to spell it out.
OUTPUT_PRODUCT_CATEGORY = {
    "Рис отварной":      "grain",
    "Гречка отварная":   "grain",
    "Киноа отварная":    "grain",
    "Кускус отварной":   "grain",
    "Булгур отварной":   "grain",
    "Спагетти отварные": "grain",
    "Чечевица отварная": "protein",   # legume protein
    "Фасоль варёная":    "protein",
    "Нут варёный":       "protein",
    "Горох варёный":     "protein",
}


def make_product_slug(name_ru: str) -> str:
    return slugify(name_ru, lowercase=True, max_length=80)


def make_recipe_slug(page_no: int, name_ru: str) -> str:
    suffix = slugify(name_ru, lowercase=True, max_length=60)
    return f"book-of-bowls-p{page_no:03d}-{suffix}"


def main() -> None:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    client: Client = create_client(url, key)

    # 1. Load 10 prep JSONs
    prep_recipes: list[dict[str, Any]] = []
    for page_no in PREP_PAGES:
        path = INPUT_DIR / f"recipe-{page_no:03d}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("skip"):
            print(f"WARN: {path} still has skip marker — re-run the prep extraction first.")
            continue
        prep_recipes.append({"page_no": page_no, "data": data, "source_file": str(path)})
    print(f"Loaded {len(prep_recipes)} prep recipes.")
    assert len(prep_recipes) == 10, "Expected 10 prep recipes."

    # 2. ingestion_runs row for this incremental run
    now = datetime.now(timezone.utc).isoformat()
    run_res = client.table("ingestion_runs").insert({
        "run_type": "pdf_vision",
        "source_label": f"prep-recipes-{now[:10]}",
        "invoker": "kai_cli",
        "prompt_or_summary": "incremental re-ingest of book-of-bowls pp 241-250 as prep recipes",
        "started_at": now,
    }).execute()
    run_id = run_res.data[0]["id"]

    # 3. Lookup existing products (by slug) so we don't duplicate raw ingredients
    existing_products = client.table("products").select("id, slug").execute()
    product_id_by_slug: dict[str, str] = {p["slug"]: p["id"] for p in existing_products.data}
    print(f"Loaded {len(product_id_by_slug)} existing products for dedup.")

    # 4. Create output products (the cooked outputs — these are all new)
    output_product_id_by_recipe_idx: dict[int, str] = {}
    new_output_product_translations: list[dict[str, Any]] = []
    new_products_count = 0
    for i, r in enumerate(prep_recipes):
        d = r["data"]
        out_name = d["output_product_ru"]
        out_slug = make_product_slug(out_name)
        if out_slug in product_id_by_slug:
            # Already exists (e.g. running twice) — reuse.
            output_product_id_by_recipe_idx[i] = product_id_by_slug[out_slug]
            continue
        category = OUTPUT_PRODUCT_CATEGORY.get(out_name, "other")
        ins = client.table("products").insert({
            "slug": out_slug,
            "category": category,
            "base_unit": "g",
            "storage_days": 5,  # default shelf life for cooked grains/legumes
        }).execute()
        new_id = ins.data[0]["id"]
        product_id_by_slug[out_slug] = new_id
        output_product_id_by_recipe_idx[i] = new_id
        new_output_product_translations.append({
            "entity_type": "product",
            "entity_id": new_id,
            "field": "name",
            "locale": "ru",
            "value": out_name,
        })
        new_products_count += 1
    if new_output_product_translations:
        client.table("entity_translations").insert(new_output_product_translations).execute()
    print(f"Created {new_products_count} output products.")

    # 5. For each prep recipe's ingredients, find-or-create raw-input products
    new_raw_product_translations: list[dict[str, Any]] = []
    raw_new = 0
    for r in prep_recipes:
        for ing in r["data"]["ingredients"]:
            slug = make_product_slug(ing["name_ru"])
            if not slug or slug in product_id_by_slug:
                continue
            # New raw ingredient — insert. Category 'other' is conservative; manual fixups in Studio.
            ins = client.table("products").insert({
                "slug": slug,
                "category": "other",  # cautious default; existing similar products would have proper category already
                "base_unit": ing.get("unit") if ing.get("unit") in ("g","ml","piece") else "g",
            }).execute()
            new_id = ins.data[0]["id"]
            product_id_by_slug[slug] = new_id
            new_raw_product_translations.append({
                "entity_type": "product",
                "entity_id": new_id,
                "field": "name",
                "locale": "ru",
                "value": ing["name_ru"].strip(),
            })
            raw_new += 1
    if new_raw_product_translations:
        client.table("entity_translations").insert(new_raw_product_translations).execute()
    print(f"Created {raw_new} new raw-ingredient products (likely just 'Рис сухой' / 'Гречка сухая' / ... type sibling-of-cooked).")

    # 6. Insert recipes
    recipe_rows: list[dict[str, Any]] = []
    for i, r in enumerate(prep_recipes):
        d = r["data"]
        recipe_rows.append({
            "slug": make_recipe_slug(r["page_no"], d["name_ru"]),
            "kind": d["kind"],
            "servings": int(d.get("servings") or 1),
            "portion_g": d.get("portion_g"),
            "total_yield_g": d.get("total_yield_g"),
            "kcal_per_100g": d.get("kcal_per_100g"),
            "kcal_per_portion": d.get("kcal_per_portion"),
            "protein_g_per_100g": d.get("protein_g_per_100g"),
            "carbs_g_per_100g": d.get("carbs_g_per_100g"),
            "fat_g_per_100g": d.get("fat_g_per_100g"),
            "prep_minutes": d.get("prep_minutes"),
            "cook_minutes": d.get("cook_minutes"),
            "cool_minutes": d.get("cool_minutes"),
            "country": d.get("country"),
            "storage_text": d.get("storage_text"),
            "source_book_slug": "book-of-bowls",
            "source_page": r["page_no"],
            "source_pipeline": "vision",
            "output_product_id": output_product_id_by_recipe_idx[i],
        })
    res = client.table("recipes").insert(recipe_rows).execute()
    recipe_id_by_index = {i: row["id"] for i, row in enumerate(res.data)}
    print(f"Inserted {len(recipe_id_by_index)} prep recipes.")

    # 7. Recipe ingredients (per-recipe insert to preserve alt_for FK)
    n_ingredients = 0
    for i, r in enumerate(prep_recipes):
        d = r["data"]
        rid = recipe_id_by_index[i]
        ing_rows: list[dict[str, Any]] = []
        for idx, ing in enumerate(d["ingredients"], start=1):
            slug = make_product_slug(ing["name_ru"])
            unit = ing.get("unit")
            if unit not in ("g","ml","piece","tsp","tbsp","cup","pinch"):
                unit = None
            ing_rows.append({
                "recipe_id": rid,
                "ingredient_no": idx,
                "product_id": product_id_by_slug[slug],
                "amount": ing.get("amount"),
                "unit": unit,
                "role_tag": ing.get("role_tag"),
                "is_optional": bool(ing.get("is_optional", False)),
                "alt_for_ingredient_no": ing.get("alt_for_ingredient_no"),
                "note": ing.get("note"),
            })
        if ing_rows:
            client.table("recipe_ingredients").insert(ing_rows).execute()
            n_ingredients += len(ing_rows)
    print(f"Inserted {n_ingredients} recipe_ingredients.")

    # 8. Recipe translations (name + instructions + tip)
    rt_rows: list[dict[str, Any]] = []
    for i, r in enumerate(prep_recipes):
        d = r["data"]
        rid = recipe_id_by_index[i]
        rt_rows.append({"entity_type": "recipe", "entity_id": rid, "field": "name", "locale": "ru", "value": d["name_ru"]})
        if d.get("instructions_ru"):
            rt_rows.append({"entity_type": "recipe", "entity_id": rid, "field": "instructions", "locale": "ru", "value": d["instructions_ru"]})
        if d.get("tip_text_ru"):
            rt_rows.append({"entity_type": "recipe", "entity_id": rid, "field": "tip_text", "locale": "ru", "value": d["tip_text_ru"]})
    client.table("entity_translations").insert(rt_rows).execute()
    print(f"Inserted {len(rt_rows)} recipe translations.")

    # 9. ingestion_raw
    raw_rows: list[dict[str, Any]] = []
    for i, r in enumerate(prep_recipes):
        raw_rows.append({
            "run_id": run_id,
            "book_slug": "book-of-bowls",
            "page_no": r["page_no"],
            "raw_json": r["data"],
            "recipe_id": recipe_id_by_index[i],
        })
    client.table("ingestion_raw").insert(raw_rows).execute()
    print(f"Inserted {len(raw_rows)} ingestion_raw backups.")

    # 10. Update ingestion_runs with totals
    client.table("ingestion_runs").update({
        "recipes_inserted": len(prep_recipes),
        "products_inserted": new_products_count + raw_new,
        "pages_processed": len(prep_recipes),
        "finished_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", run_id).execute()

    print()
    print("=" * 60)
    print("PREP INCREMENT DONE.")
    print(f"  prep recipes:          {len(prep_recipes)}")
    print(f"  output products:       {new_products_count}")
    print(f"  new raw products:      {raw_new}")
    print(f"  recipe_ingredients:    {n_ingredients}")
    print(f"  recipe translations:   {len(rt_rows)}")
    print(f"  ingestion_raw rows:    {len(raw_rows)}")
    print("=" * 60)


if __name__ == "__main__":
    sys.exit(main() or 0)
