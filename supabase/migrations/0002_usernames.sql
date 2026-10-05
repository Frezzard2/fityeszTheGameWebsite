-- Username sign-in, without handing out e-mail addresses.
--
-- The first version of this migration exposed email_for_username(), a function
-- anyone could call to turn a username into that account's e-mail address. It
-- was never applied, and it is not coming back: the lookup now happens inside
-- the `sign-in` Edge Function, which holds the service role key, performs the
-- sign-in itself and returns a session. The address never leaves the server,
-- and a caller who does not know the password learns nothing — not even
-- whether the username exists.
--
-- Safe to run more than once.

create extension if not exists citext;

create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  username   citext not null unique check (char_length(username) between 3 and 32),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A player reads and changes only their own row. Nothing here is public: the
-- Edge Function reads with the service role, which bypasses RLS entirely.
drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create the profile inside the sign-up transaction, so a duplicate username
-- fails the sign-up itself rather than leaving an account with no username.
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

-- If an earlier version of this file was ever run, take the leak out.
drop function if exists public.email_for_username(citext);
drop function if exists public.email_for_username(text);
