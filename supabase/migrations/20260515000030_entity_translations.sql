create table public.entity_translations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in (
    'product', 'recipe', 'bowl_template', 'product_tag', 'mix_match_rule', 'meal_type'
  )),
  entity_id uuid not null,
  field text not null,            -- e.g. 'name', 'description', 'instructions'
  locale text not null,           -- BCP-47 language tag: 'en', 'ru', 'pt-BR', etc.
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, field, locale)
);

create index entity_translations_lookup_idx
  on public.entity_translations (entity_type, entity_id, locale);

create trigger entity_translations_updated_at
  before update on public.entity_translations
  for each row execute function public.set_updated_at();

-- helper view: english strings for a given entity, flattened to one row
create or replace view public.translations_en as
  select entity_type, entity_id, field, value
  from public.entity_translations
  where locale = 'en';
