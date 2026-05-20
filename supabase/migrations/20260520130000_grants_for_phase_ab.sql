-- Grant table-level privileges on all Phase A/B tables.
-- service_role bypasses RLS, but still needs DML grants. authenticated needs
-- grants too (RLS handles row-level filtering — see 20260515000110_rls_policies.sql).
-- Without these, supabase-py / PostgREST calls fail with "permission denied".

-- Phase A
grant select, insert, update on public.profiles to authenticated;
grant select on public.invite_codes to authenticated;
grant select on public.entity_translations to authenticated;
grant select on public.supported_locales to authenticated;

grant all on public.profiles               to service_role;
grant all on public.invite_codes           to service_role;
grant all on public.entity_translations    to service_role;
grant all on public.supported_locales      to service_role;

-- Phase B — content tables
grant select on public.meal_types               to authenticated;
grant select on public.products                 to authenticated;
grant select on public.product_tags             to authenticated;
grant select on public.product_tag_assignments  to authenticated;
grant select on public.recipes                  to authenticated;
grant select on public.recipe_meal_types        to authenticated;
grant select on public.recipe_ingredients       to authenticated;
grant select on public.recipe_pairings          to authenticated;
grant select on public.bowl_templates           to authenticated;
grant select on public.template_slots           to authenticated;
grant select on public.slot_recipe_candidates   to authenticated;

grant all on public.meal_types               to service_role;
grant all on public.products                 to service_role;
grant all on public.product_tags             to service_role;
grant all on public.product_tag_assignments  to service_role;
grant all on public.recipes                  to service_role;
grant all on public.recipe_meal_types        to service_role;
grant all on public.recipe_ingredients       to service_role;
grant all on public.recipe_pairings          to service_role;
grant all on public.bowl_templates           to service_role;
grant all on public.template_slots           to service_role;
grant all on public.slot_recipe_candidates   to service_role;

-- Phase B — user-owned (RLS gates per-row; grants allow the role to try)
grant select, insert, update, delete on public.meal_plans       to authenticated;
grant select, insert, update, delete on public.meal_plan_items  to authenticated;

grant all on public.meal_plans       to service_role;
grant all on public.meal_plan_items  to service_role;

-- Phase B — audit (service-role only by RLS; only service_role gets grants)
grant all on public.ingestion_runs to service_role;
grant all on public.ingestion_raw  to service_role;
