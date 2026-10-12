-- India Bay online · update 3: private name and date of birth, reports kept after
-- an account is deleted, and a status the admin page can set on reports and support messages.
-- Paste into Supabase → SQL Editor → New query, then Run. Safe to run more than once.

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
