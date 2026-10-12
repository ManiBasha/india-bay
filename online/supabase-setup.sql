-- India Bay online: database setup for Supabase.
-- Paste this whole file into Supabase → SQL Editor → New query, then press Run.
-- It is safe to run again: it only creates what is missing.

create extension if not exists citext;

-- Usernames: one per account, unique (Raju and raju count as the same name).
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username citext not null unique
    check (username ~ '^[A-Za-z0-9]{1,10}$')
    check (username !~* '(admin|police|moderator|support|staff|claude|anthropic|root|system|sex|fuck|shit|bitch|chutiya|madarchod|bhenchod|gandu|randi|harami|kamina|bastard|asshole)'),
  is_guest boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "anyone can read usernames" on public.profiles;
create policy "anyone can read usernames" on public.profiles for select using (true);
drop policy if exists "create own profile" on public.profiles;
create policy "create own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Cloud saves: each player can only read and write their own.
create table if not exists public.saves (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.saves enable row level security;
drop policy if exists "read own save" on public.saves;
create policy "read own save" on public.saves for select to authenticated using (auth.uid() = user_id);
drop policy if exists "create own save" on public.saves;
create policy "create own save" on public.saves for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "update own save" on public.saves;
create policy "update own save" on public.saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admins: add yourself with the command at the bottom of this file.
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;
drop policy if exists "see own admin row" on public.admins;
create policy "see own admin row" on public.admins for select to authenticated using (auth.uid() = user_id);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- Game settings from the admin panel: everyone reads, only admins write.
create table if not exists public.game_config (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.game_config enable row level security;
drop policy if exists "anyone can read settings" on public.game_config;
create policy "anyone can read settings" on public.game_config for select using (true);
drop policy if exists "admins create settings" on public.game_config;
create policy "admins create settings" on public.game_config for insert to authenticated with check (public.is_admin());
drop policy if exists "admins update settings" on public.game_config;
create policy "admins update settings" on public.game_config for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Player suggestions and reports: players send, only admins read.
create table if not exists public.suggestions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text, region text, text text not null check (length(text) <= 400),
  created_at timestamptz not null default now()
);
alter table public.suggestions enable row level security;
drop policy if exists "send suggestion" on public.suggestions;
create policy "send suggestion" on public.suggestions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "admins read suggestions" on public.suggestions;
create policy "admins read suggestions" on public.suggestions for select to authenticated using (public.is_admin());

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter uuid not null default auth.uid() references auth.users on delete cascade,
  target_name text not null, reason text check (length(reason) <= 300), last_chat text,
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists "send report" on public.reports;
create policy "send report" on public.reports for insert to authenticated with check (auth.uid() = reporter);
drop policy if exists "admins read reports" on public.reports;
create policy "admins read reports" on public.reports for select to authenticated using (public.is_admin());

-- Support messages and account deletion (also in supabase-update-2.sql)
create table if not exists public.support_messages (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users on delete set null,
  name text, topic text,
  message text not null check (length(message) <= 1000),
  reply_email text check (length(reply_email) <= 120),
  page text,
  created_at timestamptz not null default now()
);
alter table public.support_messages enable row level security;
drop policy if exists "send support message" on public.support_messages;
create policy "send support message" on public.support_messages for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "admins read support" on public.support_messages;
create policy "admins read support" on public.support_messages for select to authenticated using (public.is_admin());

-- Lets a signed-in player delete their own account. Their username, cloud save,
-- suggestions and reports they sent are removed with it.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Private profiles, kept reports and statuses (also in supabase-update-3.sql)

-- Name and date of birth: only the player (and admins) can read them. Usernames stay public.
create table if not exists public.profile_private (
  user_id uuid primary key references auth.users on delete cascade,
  full_name text not null check (length(full_name) between 2 and 60),
  dob date not null check (dob >= date '1900-01-01'),
  parent_ok boolean,
  updated_at timestamptz not null default now()
);
alter table public.profile_private enable row level security;
drop policy if exists "read own private profile" on public.profile_private;
create policy "read own private profile" on public.profile_private for select to authenticated using (auth.uid() = user_id or public.is_admin());
drop policy if exists "create own private profile" on public.profile_private;
create policy "create own private profile" on public.profile_private for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "update own private profile" on public.profile_private;
create policy "update own private profile" on public.profile_private for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reports stay after the reporter deletes their account (the link to the account is cleared).
alter table public.reports add column if not exists reporter_name text;
alter table public.reports add column if not exists status text not null default 'new';
alter table public.reports alter column reporter drop not null;
alter table public.reports drop constraint if exists reports_reporter_fkey;
alter table public.reports add constraint reports_reporter_fkey foreign key (reporter) references auth.users (id) on delete set null;
drop policy if exists "admins update reports" on public.reports;
create policy "admins update reports" on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.support_messages add column if not exists status text not null default 'new';
drop policy if exists "admins update support" on public.support_messages;
create policy "admins update support" on public.support_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Player counts by city-agnostic age group, for planning billboard ads (admins only).
create or replace function public.audience_by_age() returns table (age_group text, players bigint)
language sql stable security definer set search_path = public
as $$
  select g, count(*) from (
    select case when a < 18 then 'under 18' when a <= 24 then '18-24' when a <= 34 then '25-34' when a <= 49 then '35-49' else '50+' end as g
    from (select extract(year from age(dob))::int as a from public.profile_private) t
  ) x where public.is_admin() group by g order by g
$$;
revoke all on function public.audience_by_age() from public, anon;
grant execute on function public.audience_by_age() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- MAKE YOURSELF ADMIN (run this separately, after you have signed in
-- to the game once with Google). Replace the email with yours:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@gmail.com'
--   on conflict do nothing;
-- ─────────────────────────────────────────────────────────────
