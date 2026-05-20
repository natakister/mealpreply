"""Normalize per-page JSON recipe extractions into Supabase rows.

Reads /tmp/ingest-full/<book>/recipe-NN.json files produced by the subagent
ingestion run, dedupes ingredients into products, inserts everything via
Supabase's service-role REST client.

Order of operations:
  1. Load all non-skipped JSONs.
  2. Create 2 ingestion_runs rows (pdf_text, pdf_vision).
  3. Build a unique products catalog (slug → name_ru, category, base_unit).
     Category inferred from a name-substring dictionary + role_tag fallback.
  4. Bulk insert products + product translations.
  5. Insert recipes (1 row per JSON) + recipe translations.
  6. Insert recipe_meal_types (1-3 per recipe).
  7. Insert recipe_ingredients (per-recipe loop to preserve alt FK order).
  8. Insert ingestion_raw (jsonb backup per page).
  9. Update ingestion_runs with final counts.

Run:
    cd /home/nata/Work/projects/mealpreply
    source scripts/.venv/bin/activate
    set -a; source scripts/.venv/.env; set +a
    python scripts/ingest/normalize.py
"""

from __future__ import annotations

import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from slugify import slugify
from supabase import Client, create_client


INPUT_DIR = Path("/tmp/ingest-full")
BOOK_PIPELINE = {
    "10-smoothies": "pdf_text",
    "12-sauces": "pdf_text",
    "sauces-and-rations": "pdf_text",
    "granola-icecream-toppings": "pdf_text",
    "book-of-bowls": "pdf_vision",
}


# Category inference: ordered substring rules. First match wins.
# Lower-cased name_ru is matched against the key.
CATEGORY_RULES: list[tuple[str, str]] = [
    # grains / starches
    ("киноа", "grain"), ("рис", "grain"), ("паста", "grain"), ("лапша", "grain"),
    ("спагетти", "grain"), ("лаваш", "grain"), ("пита", "grain"), ("тортилья", "grain"),
    ("булгур", "grain"), ("кускус", "grain"), ("гречка", "grain"), ("гречневая", "grain"),
    ("овсян", "grain"), ("хлопья", "grain"), ("хлеб", "grain"), ("картофел", "grain"),
    ("батат", "grain"), ("мука", "grain"), ("крекер", "grain"), ("хлебц", "grain"),
    ("полба", "grain"), ("перловка", "grain"), ("пшено", "grain"),

    # cheeses & dairy
    ("халуми", "dairy"), ("фета", "dairy"), ("моцарелла", "dairy"), ("маскарпоне", "dairy"),
    ("рикотта", "dairy"), ("пармезан", "dairy"), ("чеддер", "dairy"), ("козий сыр", "dairy"),
    ("сыр", "dairy"), ("творог", "dairy"), ("йогурт", "dairy"),
    ("молоко коров", "dairy"), ("молоко", "dairy"), ("сметана", "dairy"), ("сливки", "dairy"),
    ("кефир", "dairy"), ("ряженка", "dairy"),

    # animal protein
    ("лосос", "protein"), ("тунец", "protein"), ("креветк", "protein"), ("кальмар", "protein"),
    ("треск", "protein"), ("сёмга", "protein"), ("семга", "protein"), ("горбуш", "protein"),
    ("рыба", "protein"), ("филе рыбы", "protein"),
    ("курица", "protein"), ("куриная", "protein"), ("куриное", "protein"), ("куриный", "protein"),
    ("индейка", "protein"), ("индейки", "protein"), ("утка", "protein"),
    ("говядина", "protein"), ("свинина", "protein"), ("баранина", "protein"), ("ветчина", "protein"),
    ("бекон", "protein"), ("колбаса", "protein"), ("сосиски", "protein"), ("фарш", "protein"),
    ("яйц", "protein"), ("белк", "protein"),  # egg whites etc.
    # plant proteins
    ("тофу", "protein"), ("нут", "protein"), ("фасол", "protein"), ("чечевиц", "protein"),
    ("эдамам", "protein"), ("горох", "protein"), ("бобы", "protein"), ("маш", "protein"),
    ("сейтан", "protein"),

    # fruits
    ("яблок", "fruit"), ("банан", "fruit"), ("груш", "fruit"), ("ягод", "fruit"),
    ("черник", "fruit"), ("малин", "fruit"), ("клубник", "fruit"), ("ежевик", "fruit"),
    ("смородин", "fruit"), ("брусник", "fruit"), ("клюкв", "fruit"), ("вишн", "fruit"),
    ("черешн", "fruit"), ("слив", "fruit"), ("персик", "fruit"), ("нектарин", "fruit"),
    ("абрикос", "fruit"), ("манго", "fruit"), ("ананас", "fruit"), ("папай", "fruit"),
    ("апельсин", "fruit"), ("лимон", "fruit"), ("лайм", "fruit"), ("грейпфрут", "fruit"),
    ("мандарин", "fruit"), ("киви", "fruit"), ("гранат", "fruit"), ("виноград", "fruit"),
    ("инжир", "fruit"), ("дын", "fruit"), ("арбуз", "fruit"), ("кокос", "fruit"),
    ("сушёные яблок", "fruit"), ("изюм", "fruit"), ("курага", "fruit"), ("чернослив", "fruit"),
    ("финик", "fruit"), ("сухофрукт", "fruit"),

    # vegetables / fibre
    ("огурец", "vegetable"), ("огурц", "vegetable"), ("помидор", "vegetable"), ("томат", "vegetable"),
    ("салат", "vegetable"), ("шпинат", "vegetable"), ("руккола", "vegetable"), ("капуст", "vegetable"),
    ("брокколи", "vegetable"), ("цветная", "vegetable"), ("авокадо", "vegetable"),
    ("олив", "vegetable"), ("каперс", "vegetable"), ("перец", "vegetable"), ("болгарский перец", "vegetable"),
    ("лук", "vegetable"), ("шалот", "vegetable"), ("порей", "vegetable"), ("зелёный лук", "vegetable"),
    ("морков", "vegetable"), ("свёкл", "vegetable"), ("свекл", "vegetable"), ("редис", "vegetable"),
    ("гриб", "vegetable"), ("шампиньон", "vegetable"), ("вешенк", "vegetable"), ("опят", "vegetable"),
    ("кабач", "vegetable"), ("цукини", "vegetable"), ("цуккини", "vegetable"), ("баклажан", "vegetable"),
    ("чеснок", "vegetable"), ("имбир", "vegetable"), ("сельдер", "vegetable"), ("спаржа", "vegetable"),
    ("тыкв", "vegetable"), ("кукуруз", "vegetable"), ("артишок", "vegetable"), ("батат", "vegetable"),
    ("маринованн", "vegetable"), ("квашен", "vegetable"),

    # herbs / spices
    ("мята", "spice"), ("базилик", "spice"), ("петрушк", "spice"), ("укроп", "spice"),
    ("кинза", "spice"), ("тимьян", "spice"), ("розмарин", "spice"), ("орегано", "spice"),
    ("шафран", "spice"), ("корица", "spice"), ("паприка", "spice"), ("куркум", "spice"),
    ("кориандр", "spice"), ("кардамон", "spice"), ("зира", "spice"), ("гвоздика", "spice"),
    ("мускат", "spice"), ("карри", "spice"), ("перец чёрн", "spice"), ("перец красн", "spice"),
    ("чили", "spice"), ("васаби", "spice"), ("горчица сухая", "spice"), ("ваниль", "spice"),
    ("соль", "spice"), ("перец", "spice"),  # fallbacks (more specific match above wins)

    # fats / oils
    ("оливковое масло", "fat"), ("кокосовое масло", "fat"), ("подсолнечное масло", "fat"),
    ("кунжутное масло", "fat"), ("льняное масло", "fat"), ("масло гхи", "fat"),
    ("сливочное масло", "fat"), ("масло", "fat"),

    # sauces / condiments (sauce as ingredient)
    ("соус", "sauce"), ("кетчуп", "sauce"), ("майонез", "sauce"), ("тартар", "sauce"),
    ("хумус", "sauce"), ("песто", "sauce"), ("тахини", "sauce"), ("горчиц", "sauce"),
    ("сальса", "sauce"), ("аджика", "sauce"), ("ткемали", "sauce"), ("барбекю", "sauce"),
    ("уксус", "sauce"), ("бальзамик", "sauce"), ("бальзамическ", "sauce"),
    ("вустерский", "sauce"), ("терияки", "sauce"), ("соевый", "sauce"),
    ("лимонный сок", "sauce"), ("сок лимона", "sauce"), ("сок лайма", "sauce"),

    # nuts / seeds → topping
    ("грецк", "topping"), ("кешью", "topping"), ("миндал", "topping"), ("фундук", "topping"),
    ("фисташ", "topping"), ("пекан", "topping"), ("кедров", "topping"), ("арахис", "topping"),
    ("кунжут", "topping"), ("семена чиа", "topping"), ("семена льна", "topping"),
    ("семена подсолнечник", "topping"), ("тыквенные семечки", "topping"), ("семечки", "topping"),
    ("семена", "topping"),

    # sweeteners
    ("мёд", "sweetener"), ("мед", "sweetener"), ("сахар", "sweetener"),
    ("эритритол", "sweetener"), ("стеви", "sweetener"), ("кленовый сироп", "sweetener"),
    ("сироп", "sweetener"),

    # beverages
    ("кофе", "beverage"), ("чай", "beverage"), ("сок ", "beverage"), ("вода", "beverage"),
    ("кокосовая вода", "beverage"),
]


# Role-tag fallback when no substring rule matched.
ROLE_TAG_TO_CATEGORY = {
    "base": "grain",
    "protein": "protein",
    "fiber": "vegetable",
    "sauce": "sauce",
    "topping": "topping",
}


def infer_category(name_ru: str, role_tag: str | None) -> str:
    name_lower = name_ru.lower()
    for substring, cat in CATEGORY_RULES:
        if substring in name_lower:
            return cat
    if role_tag and role_tag in ROLE_TAG_TO_CATEGORY:
        return ROLE_TAG_TO_CATEGORY[role_tag]
    return "other"


def infer_base_unit(amount: float | None, unit: str | None) -> str:
    if unit in ("g", "ml", "piece"):
        return unit
    # tsp/tbsp/cup/pinch are recipe-level units; default the product to g.
    return "g"


def make_recipe_slug(book_slug: str, page_no: int, name_ru: str) -> str:
    suffix = slugify(name_ru, lowercase=True, max_length=60)
    return f"{book_slug}-p{page_no:03d}-{suffix}"


def make_product_slug(name_ru: str) -> str:
    return slugify(name_ru, lowercase=True, max_length=80)


def load_all_recipes() -> list[dict[str, Any]]:
    raw_recipes: list[dict[str, Any]] = []
    for book_slug in BOOK_PIPELINE:
        book_dir = INPUT_DIR / book_slug
        for path in sorted(book_dir.glob("recipe-*.json")):
            data = json.loads(path.read_text(encoding="utf-8"))
            if data.get("skip"):
                continue
            stem = path.stem  # "recipe-NN" or "recipe-NNN"
            page_no = int(stem.split("-")[-1])
            raw_recipes.append({
                "book_slug": book_slug,
                "page_no": page_no,
                "pipeline": BOOK_PIPELINE[book_slug],
                "data": data,
                "source_file": str(path),
            })
    return raw_recipes


def chunked(seq: list[Any], n: int):
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


def main() -> None:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    client: Client = create_client(url, key)

    # 1. Load
    raw_recipes = load_all_recipes()
    print(f"Loaded {len(raw_recipes)} non-skipped recipes from /tmp/ingest-full/.")

    by_pipeline: dict[str, int] = defaultdict(int)
    for r in raw_recipes:
        by_pipeline[r["pipeline"]] += 1
    for pipeline, n in by_pipeline.items():
        print(f"  {pipeline}: {n} recipes")

    # 2. ingestion_runs (one per pipeline)
    now = datetime.now(timezone.utc).isoformat()
    run_ids: dict[str, str] = {}
    for pipeline in by_pipeline:
        res = client.table("ingestion_runs").insert({
            "run_type": pipeline,
            "source_label": f"subagent-driven-{now[:10]}-{pipeline}",
            "invoker": "kai_cli",
            "prompt_or_summary": "subagent dispatch → per-page JSON → normalizer → DB",
            "started_at": now,
            "finished_at": now,
        }).execute()
        run_ids[pipeline] = res.data[0]["id"]
    print(f"Created {len(run_ids)} ingestion_runs.")

    # 3. Build unique product catalog
    products_by_slug: dict[str, dict[str, Any]] = {}
    for r in raw_recipes:
        for ing in r["data"]["ingredients"]:
            slug = make_product_slug(ing["name_ru"])
            if not slug:
                continue
            if slug in products_by_slug:
                continue
            products_by_slug[slug] = {
                "slug": slug,
                "name_ru": ing["name_ru"].strip(),
                "category": infer_category(ing["name_ru"], ing.get("role_tag")),
                "base_unit": infer_base_unit(ing.get("amount"), ing.get("unit")),
            }
    print(f"Built catalog of {len(products_by_slug)} unique products.")

    # 4. Bulk-insert products
    product_rows = [{
        "slug": p["slug"],
        "category": p["category"],
        "base_unit": p["base_unit"],
    } for p in products_by_slug.values()]

    product_id_by_slug: dict[str, str] = {}
    for chunk in chunked(product_rows, 200):
        res = client.table("products").insert(chunk).execute()
        for row in res.data:
            product_id_by_slug[row["slug"]] = row["id"]
    print(f"Inserted {len(product_id_by_slug)} products.")

    # 5. Product translations (name in Russian)
    product_translation_rows = [{
        "entity_type": "product",
        "entity_id": product_id_by_slug[slug],
        "field": "name",
        "locale": "ru",
        "value": p["name_ru"],
    } for slug, p in products_by_slug.items()]

    n_pt = 0
    for chunk in chunked(product_translation_rows, 500):
        res = client.table("entity_translations").insert(chunk).execute()
        n_pt += len(res.data)
    print(f"Inserted {n_pt} product name translations.")

    # 6. Recipes
    recipe_rows: list[dict[str, Any]] = []
    for r in raw_recipes:
        d = r["data"]
        recipe_rows.append({
            "slug": make_recipe_slug(r["book_slug"], r["page_no"], d["name_ru"]),
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
            "source_book_slug": r["book_slug"],
            "source_page": r["page_no"],
            "source_pipeline": "vision" if r["pipeline"] == "pdf_vision" else "text",
        })

    recipe_id_by_index: dict[int, str] = {}
    offset = 0
    for chunk in chunked(recipe_rows, 100):
        res = client.table("recipes").insert(chunk).execute()
        for j, row in enumerate(res.data):
            recipe_id_by_index[offset + j] = row["id"]
        offset += len(chunk)
    print(f"Inserted {len(recipe_id_by_index)} recipes.")

    # 7. Recipe meal_types
    meal_type_rows: list[dict[str, Any]] = []
    for i, r in enumerate(raw_recipes):
        for mt in r["data"].get("meal_types") or []:
            meal_type_rows.append({
                "recipe_id": recipe_id_by_index[i],
                "meal_type": mt,
            })
    for chunk in chunked(meal_type_rows, 500):
        client.table("recipe_meal_types").insert(chunk).execute()
    print(f"Inserted {len(meal_type_rows)} recipe_meal_types.")

    # 8. Recipe ingredients (per-recipe to preserve alt_for FK ordering)
    n_ingredients = 0
    for i, r in enumerate(raw_recipes):
        ings = r["data"]["ingredients"]
        recipe_id = recipe_id_by_index[i]
        ing_rows: list[dict[str, Any]] = []
        for idx, ing in enumerate(ings, start=1):
            slug = make_product_slug(ing["name_ru"])
            if not slug or slug not in product_id_by_slug:
                continue
            unit = ing.get("unit")
            if unit not in ("g", "ml", "piece", "tsp", "tbsp", "cup", "pinch"):
                unit = None
            ing_rows.append({
                "recipe_id": recipe_id,
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
    print(f"Inserted {n_ingredients} recipe_ingredients across {len(raw_recipes)} recipes.")

    # 9. Recipe translations
    rt_rows: list[dict[str, Any]] = []
    for i, r in enumerate(raw_recipes):
        d = r["data"]
        rid = recipe_id_by_index[i]
        rt_rows.append({"entity_type": "recipe", "entity_id": rid, "field": "name", "locale": "ru", "value": d["name_ru"]})
        if d.get("subtitle_ru"):
            rt_rows.append({"entity_type": "recipe", "entity_id": rid, "field": "subtitle", "locale": "ru", "value": d["subtitle_ru"]})
        if d.get("instructions_ru"):
            rt_rows.append({"entity_type": "recipe", "entity_id": rid, "field": "instructions", "locale": "ru", "value": d["instructions_ru"]})
        if d.get("tip_text_ru"):
            rt_rows.append({"entity_type": "recipe", "entity_id": rid, "field": "tip_text", "locale": "ru", "value": d["tip_text_ru"]})

    n_rt = 0
    for chunk in chunked(rt_rows, 500):
        res = client.table("entity_translations").insert(chunk).execute()
        n_rt += len(res.data)
    print(f"Inserted {n_rt} recipe translations.")

    # 10. ingestion_raw (jsonb backup)
    raw_rows: list[dict[str, Any]] = []
    for i, r in enumerate(raw_recipes):
        raw_rows.append({
            "run_id": run_ids[r["pipeline"]],
            "book_slug": r["book_slug"],
            "page_no": r["page_no"],
            "raw_json": r["data"],
            "recipe_id": recipe_id_by_index[i],
        })
    for chunk in chunked(raw_rows, 100):
        client.table("ingestion_raw").insert(chunk).execute()
    print(f"Inserted {len(raw_rows)} ingestion_raw backups.")

    # 11. Update ingestion_runs with totals
    for pipeline, run_id in run_ids.items():
        n_recipes = by_pipeline[pipeline]
        n_products_created = len(products_by_slug)  # global, not per-pipeline; close enough for v1
        client.table("ingestion_runs").update({
            "recipes_inserted": n_recipes,
            "pages_processed": n_recipes,
            "products_inserted": n_products_created if pipeline == "pdf_text" else 0,  # avoid double-counting
            "finished_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", run_id).execute()

    print()
    print("=" * 60)
    print("DONE.")
    print(f"  recipes:               {len(raw_recipes)}")
    print(f"  unique products:       {len(products_by_slug)}")
    print(f"  recipe_ingredients:    {n_ingredients}")
    print(f"  recipe_meal_types:     {len(meal_type_rows)}")
    print(f"  product translations:  {n_pt}")
    print(f"  recipe translations:   {n_rt}")
    print(f"  ingestion_raw rows:    {len(raw_rows)}")
    print(f"  ingestion_runs rows:   {len(run_ids)}")
    print("=" * 60)


if __name__ == "__main__":
    sys.exit(main() or 0)
