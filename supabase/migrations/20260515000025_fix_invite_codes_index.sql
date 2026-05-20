-- The original invite_codes_unused_idx was on (code), which is already PK.
-- Postgres' PK index already serves all point lookups; the partial index is redundant.
-- Replace it with an index that supports the actual admin query — "find unredeemed codes ordered by recency".
drop index if exists public.invite_codes_unused_idx;
create index invite_codes_active_idx on public.invite_codes(created_at)
  where redeemed_at is null;
