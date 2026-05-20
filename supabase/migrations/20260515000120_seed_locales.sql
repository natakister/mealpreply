create table public.supported_locales (
  locale text primary key,
  display_name text not null,
  is_default boolean not null default false,
  enabled boolean not null default true
);

insert into public.supported_locales (locale, display_name, is_default, enabled) values
  ('en', 'English', true, true);

-- Adding a new locale (e.g., Russian) at v1.5:
--   insert into public.supported_locales (locale, display_name) values ('ru', 'Русский');
--   then bulk-insert ru rows into entity_translations.
-- No schema change needed.
