-- Audit log for PDF-ingestion + LLM-generated content runs.
-- One ingestion_runs row per pipeline invocation; one ingestion_raw row per processed page.
-- Storing raw LLM output as jsonb lets us re-derive normalized tables without re-hitting Claude
-- if the schema needs reshaping (Option C backwards path).

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null check (run_type in ('pdf_text','pdf_vision','llm_recipe','llm_plan_strategy')),
  source_label text not null,                    -- e.g. 'book-of-bowls.pdf@2026-05-19'
  invoker text not null,                         -- 'kai_cli','edge_function','manual'
  prompt_or_summary text,
  output_summary jsonb,                          -- aggregate stats, not per-page raw output
  products_inserted int not null default 0,
  recipes_inserted  int not null default 0,
  pages_processed   int not null default 0,
  errors_count int not null default 0,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);

create index ingestion_runs_type_time_idx on public.ingestion_runs(run_type, started_at desc);

-- Per-page raw output. One row per (book_slug, page_no) within a single run.
-- raw_json carries the full Pydantic-validated LLM dump before normalization to recipes/products.
create table public.ingestion_raw (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.ingestion_runs(id) on delete cascade,
  book_slug text not null,
  page_no int not null check (page_no >= 1),
  raw_json jsonb not null,
  recipe_id uuid references public.recipes(id) on delete set null,  -- populated after normalization
  created_at timestamptz not null default now(),
  unique (run_id, book_slug, page_no)
);

create index ingestion_raw_book_page_idx on public.ingestion_raw(book_slug, page_no);
create index ingestion_raw_recipe_idx    on public.ingestion_raw(recipe_id);
