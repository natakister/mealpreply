-- Canonical meal-type vocabulary. Fixed set for v1; extending = add a row + plan migration.
-- Used by: recipe_meal_types (many-to-many with recipes), bowl_templates.meal_type,
-- meal_plan_items.meal_type.
create table public.meal_types (
  slug text primary key check (slug in ('breakfast','lunch','dinner','snack')),
  position int not null unique
);

insert into public.meal_types (slug, position) values
  ('breakfast', 1),
  ('lunch',     2),
  ('dinner',    3),
  ('snack',     4);
