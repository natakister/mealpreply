-- Allow user-extension of the products catalog.
-- null = system catalog (managed by ingestion + admin via Studio);
-- non-null = user-added product (will be visible only to that user via RLS in a later migration).
--
-- The current read-all-auth policy on products is unchanged — it still lets anyone read all
-- rows. Once a user-add UI ships, we'll tighten the policy to "catalog OR own" in a separate
-- migration. Adding the column now is cheap and avoids a future schema-change-with-data.

alter table public.products
  add column created_by_user_id uuid references auth.users(id) on delete cascade;

create index products_created_by_user_idx
  on public.products(created_by_user_id) where created_by_user_id is not null;
