-- India Bay online · update 4 (v4.2): invite friends.
-- A friend who opens your invite link and starts a new account is linked to you. When that friend's account
-- is a Google account (not a guest; checked on the sign-in record, which players cannot change), you get the invite reward in the game. Up to 20 rewarded invites per player.
-- Paste into Supabase → SQL Editor → New query, then Run. Safe to run more than once.

create table if not exists public.referrals (
  referee uuid primary key references auth.users on delete cascade,     -- the friend who joined
  referrer uuid not null references auth.users on delete cascade,       -- the player who invited them
  created_at timestamptz not null default now(),
  claimed boolean not null default false,
  check (referee <> referrer)
);
create index if not exists referrals_referrer on public.referrals (referrer);
alter table public.referrals enable row level security;
drop policy if exists "see own referrals" on public.referrals;
create policy "see own referrals" on public.referrals for select to authenticated using (auth.uid() = referrer or auth.uid() = referee or public.is_admin());
-- no insert or update policies: rows are only written by the two functions below

-- Called once by a new player who came from an invite link. code = the inviter's username.
create or replace function public.register_referral(code text) returns text
language plpgsql security definer set search_path = public
as $$
declare inviter uuid; made timestamptz;
begin
  if auth.uid() is null then return 'signin'; end if;
  if exists (select 1 from referrals where referee = auth.uid()) then return 'done'; end if;
  select id into inviter from profiles where username = code::citext;
  if inviter is null then return 'unknown'; end if;
  if inviter = auth.uid() then return 'self'; end if;
  select created_at into made from auth.users where id = auth.uid();
  if made < now() - interval '3 days' then return 'old'; end if;          -- only brand-new players count
  insert into referrals (referee, referrer) values (auth.uid(), inviter);
  return 'ok';
end $$;
revoke all on function public.register_referral(text) from public, anon;
grant execute on function public.register_referral(text) to authenticated;

-- Called by the inviter: marks friends who now have a Google account as rewarded and returns how many are new.
create or replace function public.claim_referrals() returns int
language plpgsql security definer set search_path = public
as $$
declare done_before int; n int;
begin
  if auth.uid() is null then return 0; end if;
  select count(*) into done_before from referrals where referrer = auth.uid() and claimed;
  with ok as (
    select r.referee from referrals r join auth.users u on u.id = r.referee
    where r.referrer = auth.uid() and not r.claimed and not coalesce(u.is_anonymous, false)
    order by r.created_at limit greatest(0, 20 - done_before)
  )
  update referrals set claimed = true where referee in (select referee from ok);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.claim_referrals() from public, anon;
grant execute on function public.claim_referrals() to authenticated;

-- Counts for the Invite app: friends who joined, still guests, already rewarded.
create or replace function public.my_referrals() returns table (joined bigint, guests bigint, rewarded bigint)
language sql stable security definer set search_path = public
as $$
  select count(*), count(*) filter (where coalesce(u.is_anonymous, true)), count(*) filter (where r.claimed)
  from referrals r left join auth.users u on u.id = r.referee where r.referrer = auth.uid()
$$;
revoke all on function public.my_referrals() from public, anon;
grant execute on function public.my_referrals() to authenticated;
