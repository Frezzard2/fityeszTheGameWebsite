-- Run this once in the Supabase SQL editor.
--
-- The desktop game writes the same row as the website, and needs four things
-- the website has no use for: where in its own script the run is, the lines it
-- has heard, a boss fight's move counters, and what is on the stage (the
-- background, the location, the chapter line - a scene in the middle of a
-- chapter does not set those itself). All four are nullable and the website's
-- queries never name them, so this changes nothing for the browser.
--
-- chapter now carries the real chapter number (0 for the prologue, 1-7 for the
-- chapters). The website only ever writes 1 or 2, and reads anything from 2 up
-- as "past the web demo", which is exactly what a desktop run beyond chapter
-- one is - so no website query changes here either.
--
-- Safe to run more than once.

alter table public.saves add column if not exists scene text;
alter table public.saves add column if not exists log   jsonb not null default '[]';
alter table public.saves add column if not exists fight jsonb;
alter table public.saves add column if not exists scenery jsonb;

comment on column public.saves.scene is
  'Desktop only: the scene method the run is in. Null for a run from the website.';
comment on column public.saves.log is
  'Desktop only: the run transcript, newest last, capped at 300 entries.';
comment on column public.saves.fight is
  'Desktop only: a boss fight in progress - hp and move counters.';
comment on column public.saves.scenery is
  'Desktop only: the stage to reopen on - background, character, location, chapter line.';
