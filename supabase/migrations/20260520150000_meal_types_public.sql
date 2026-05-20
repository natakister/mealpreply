-- meal_types is a fixed 4-row vocabulary (breakfast/lunch/dinner/snack).
-- No privacy concern; expose to anon so the app's pre-auth smoke ping works
-- and so client code can render meal-type labels before sign-in.

grant select on public.meal_types to anon;

drop policy if exists "meal_types_read_all" on public.meal_types;
create policy "meal_types_read_all" on public.meal_types
  for select using (true);
