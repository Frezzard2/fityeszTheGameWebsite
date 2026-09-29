-- Username sign-in.
--
-- Supabase authenticates on email, so signing in with a username needs a
-- lookup from one to the other before the auth call.
--
-- READ THIS BEFORE RUNNING: email_for_username() hands the caller an email
-- address in exchange for a username, and anyone can call it. That is the
-- cost of username sign-in on a static site with no server of our own:
--   * usernames become enumerable — a caller can probe which ones exist
--   * a known username reveals that account's email address
-- The function returns nothing else, and never returns a password hash or a
-- user id. If that trade is not acceptable, drop this migration and keep
-- email-only sign-in.

create extension if not exists citext;

create table if not exists public.profiles (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  username citext not null unique check (char_length(username) between 3 and 32),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A player can read and change only their own row. The lookup below runs as
-- the definer precisely so it does not need a public read policy.
drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create the profile as part of the sign-up transaction, so a duplicate
-- username fails the sign-up itself rather than leaving an account with no
-- username attached.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ? 'display_name' then
    insert into public.profiles (user_id, username)
    values (new.id, new.raw_user_meta_data ->> 'display_name');
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The lookup. Returns only the email, only for an exact username match.
create or replace function public.email_for_username(p_username citext)
returns text
language sql
security definer
stable
set search_path = public, auth
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where p.username = p_username
  limit 1
$$;

revoke all on function public.email_for_username(citext) from public;
grant execute on function public.email_for_username(citext) to anon, authenticated;
