-- Run this once in the Supabase SQL editor.
--
-- One row per player per slot. Row-level security is the only thing standing
-- between one player's save and another's, because the anon key ships in the
-- browser — so every policy below is load-bearing.

create table if not exists public.saves (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  slot        smallint not null default 1 check (slot between 1 and 3),
  display_name text,
  player_name text,
  chapter     smallint not null default 1,
  xp          int not null default 0,
  lebukas     int not null default 0,
  szint       int not null default 1,
  items       text[] not null default '{}',
  history     jsonb not null default '[]',
  updated_at  timestamptz not null default now(),
  unique (user_id, slot)
);

alter table public.saves enable row level security;

drop policy if exists saves_own on public.saves;
create policy saves_own on public.saves
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
