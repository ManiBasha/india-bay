-- India Bay online · update 5 (Beta v1.0.0): test accounts.
-- Testers sign in like everyone else (Google is best). Admins and testers see "Test play" in their profile:
-- a separate save with everything unlocked and test tools. Their real save is never touched.
-- Add or remove testers on the /admin page (Testers tab), or with the commands at the bottom.
-- Paste into Supabase → SQL Editor → New query, then Run. Safe to run more than once.

create table if not exists public.testers (
  user_id uuid primary key references auth.users on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.testers enable row level security;
drop policy if exists "see own tester row" on public.testers;
create policy "see own tester row" on public.testers for select to authenticated using (auth.uid() = user_id or public.is_admin());

create or replace function public.is_tester() returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_admin() or exists (select 1 from public.testers where user_id = auth.uid()) $$;
grant execute on function public.is_tester() to authenticated;

-- Admin only: add, remove and list testers by username
create or replace function public.add_tester(name text) returns text
language plpgsql security definer set search_path = public
as $$ declare u uuid; begin
  if not public.is_admin() then return 'not admin'; end if;
  select id into u from profiles where username = name::citext; if u is null then return 'no such username'; end if;
  insert into testers (user_id) values (u) on conflict do nothing; return 'ok';
end $$;
create or replace function public.remove_tester(name text) returns text
language plpgsql security definer set search_path = public
as $$ declare u uuid; begin
  if not public.is_admin() then return 'not admin'; end if;
  select id into u from profiles where username = name::citext; delete from testers where user_id = u; return 'ok';
end $$;
create or replace function public.list_testers() returns table (username text, added_at timestamptz)
language sql stable security definer set search_path = public
as $$ select p.username::text, t.added_at from testers t join profiles p on p.id = t.user_id where public.is_admin() order by t.added_at desc $$;
revoke all on function public.add_tester(text), public.remove_tester(text), public.list_testers() from public, anon;
grant execute on function public.add_tester(text), public.remove_tester(text), public.list_testers() to authenticated;

-- Or by hand: insert into public.testers (user_id) select id from public.profiles where username = 'TESTNAME';
