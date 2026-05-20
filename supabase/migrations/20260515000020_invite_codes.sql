create table public.invite_codes (
  code text primary key,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  max_uses int not null default 1 check (max_uses >= 1),
  used_count int not null default 0,
  note text,
  expires_at timestamptz
);

create index invite_codes_unused_idx on public.invite_codes(code)
  where redeemed_at is null;
