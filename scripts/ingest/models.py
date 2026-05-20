"""Pydantic models for raw recipe extraction from PDF source books.

Shared between text pipeline (pypdf-extracted page text) and vision pipeline
(rendered PNG of book-of-bowls pages). One RawRecipe per source page.

The normalizer (separate module) converts RawRecipe → Supabase rows in
recipes / recipe_ingredients / recipe_meal_types / recipe_pairings / products
+ entity_translations.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


Unit = Literal["g", "ml", "piece", "tsp", "tbsp", "cup", "pinch"]
RoleTag = Literal["base", "protein", "fiber", "sauce", "topping"]
RecipeKind = Literal["meal", "side", "component"]
MealType = Literal["breakfast", "lunch", "dinner", "snack"]


class RawIngredient(BaseModel):
    """One ingredient line in a recipe.

    name_ru: verbatim from source.
    name_en: leave None at extraction time; the normalizer can backfill from a glossary.
    amount: null only when the source says 'по вкусу' / 'to taste' / similar.
    unit: leave None if the amount is unitless (e.g. 'по вкусу').
    role_tag: fill for bowl recipes (book-of-bowls); null for smoothies/sauces/granola.
    alt_for_ingredient_no: 1-indexed reference to a previous ingredient in this recipe;
        use this when the source says 'или X' to indicate X is an alternate. The alternate
        gets its own ingredient row with alt_for_ingredient_no set.
    note: any verbatim parenthetical from the source that doesn't fit other fields
        (e.g. 'свежий или замороженный', '5 г').
    """

    name_ru: str
    name_en: Optional[str] = None
    amount: Optional[float] = None
    unit: Optional[Unit] = None
    role_tag: Optional[RoleTag] = None
    is_optional: bool = False
    alt_for_ingredient_no: Optional[int] = Field(default=None, ge=1)
    note: Optional[str] = None

    @field_validator("name_ru")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


class RawRecipe(BaseModel):
    """One recipe extracted from one source page.

    name_ru: verbatim title from the source (single line, no styling).
    subtitle_ru: optional secondary line, e.g. 'С ЛОСОСЕМ И ФЕТОЙ' on bowl pages.
    kind: 'meal' for bowls/smoothies/granola/ice-cream (eaten on their own);
          'side' for sauces; 'component' for toppings/base mixes that aren't standalone meals.
    meal_types: which meal slots this recipe fills. Empty list for sauces and components.
        Smoothies typically ['breakfast','snack']; bowls typically ['lunch','dinner'];
        granola typically ['breakfast','snack'].
    servings: how many portions; default 2 if source doesn't specify.
    portion_g / total_yield_g: weights in grams if source states them.
    kcal_per_100g / kcal_per_portion / macros: per-100g preferred when both given.
    prep_minutes / cook_minutes / cool_minutes: from source if stated.
    country: only present for 12-sauces book (e.g. 'Italy','Georgia').
    storage_text: verbatim storage instructions if present ('5 дней в холодильнике').
    ingredients: ordered list, 1-indexed implicitly by position.
    instructions_ru: full numbered steps as plain text, preserving the source numbering
        (the rendered string will look like '1. ...\\n2. ...\\n3. ...'). Single multi-line
        string keeps translation simple (one row per locale in entity_translations).
    tip_text_ru: the P.S. or 👉 fishka tip line, verbatim, if present.
    """

    name_ru: str
    subtitle_ru: Optional[str] = None
    kind: RecipeKind
    meal_types: list[MealType] = Field(default_factory=list)
    servings: int = Field(default=2, ge=1)
    portion_g: Optional[float] = None
    total_yield_g: Optional[float] = None
    kcal_per_100g: Optional[float] = None
    kcal_per_portion: Optional[float] = None
    protein_g_per_100g: Optional[float] = None
    fat_g_per_100g: Optional[float] = None
    carbs_g_per_100g: Optional[float] = None
    prep_minutes: Optional[int] = Field(default=None, ge=0)
    cook_minutes: Optional[int] = Field(default=None, ge=0)
    cool_minutes: Optional[int] = Field(default=None, ge=0)
    country: Optional[str] = None
    storage_text: Optional[str] = None
    ingredients: list[RawIngredient]
    instructions_ru: str
    tip_text_ru: Optional[str] = None

    @field_validator("name_ru")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()

    @field_validator("ingredients")
    @classmethod
    def at_least_one_ingredient(cls, v: list[RawIngredient]) -> list[RawIngredient]:
        if not v:
            raise ValueError("recipe must have at least one ingredient")
        return v
