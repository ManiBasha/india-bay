-- India Bay · Supabase update 10 (Beta v1.01.24)
-- Run once in Supabase → SQL Editor, after update 9. Safe to run again.
--   • number plates: every player has one unique plate, linked to their account and username
--   • player businesses: tea stalls, cafés, hotels and lodges that players open in the world, seen by everyone,
--     with a visit counter (visitors add to the owner's earnings)

-- ---------- number plates ----------
create table if not exists public.plates (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plate text not null,
  updated_at timestamptz not null default now(),
  constraint plate_format check (plate ~ '^[A-Z0-9][A-Z0-9 ]{1,9}$' and plate !~ '^BAY( |$)')
);
create unique index if not exists plates_plate_key on public.plates (plate);
alter table public.plates enable row level security;
drop policy if exists "plates readable" on public.plates;
create policy "plates readable" on public.plates for select using (true);
grant select on public.plates to anon, authenticated;

-- your plate; the first time, it is made from your username (with a number added if that is taken)
create or replace function public.my_plate(p_default text) returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); cur text; base text; cand text; i int := 1;
begin
  if me is null then return null; end if;
  select plate into cur from plates where user_id = me; if cur is not null then return cur; end if;
  base := left(regexp_replace(upper(coalesce(p_default, 'PLAYER')), '[^A-Z0-9 ]', '', 'g'), 10);
  base := regexp_replace(trim(base), '\s+', ' ', 'g');
  if base = '' or length(base) < 2 or base ~ '^BAY( |$)' then base := 'IB ' || left(replace(me::text, '-', ''), 4); end if;
  cand := upper(base);
  while exists (select 1 from plates where plate = cand) loop
    i := i + 1; cand := left(base, 10 - length(i::text) - 1) || ' ' || i;
  end loop;
  insert into plates (user_id, plate) values (me, cand) on conflict (user_id) do nothing;
  select plate into cur from plates where user_id = me; return cur;
end $$;
grant execute on function public.my_plate(text) to authenticated;

-- choose a new plate: 'ok', 'taken' or a reason
create or replace function public.claim_plate(p_plate text) returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); t text;
begin
  if me is null then return 'Sign in first'; end if;
  if exists (select 1 from profiles where id = me and is_guest) then return 'Sign in with Google to choose a plate'; end if;
  t := regexp_replace(trim(upper(coalesce(p_plate, ''))), '\s+', ' ', 'g');
  if t !~ '^[A-Z0-9][A-Z0-9 ]{1,9}$' then return 'Use 2 to 10 letters and numbers'; end if;
  if t ~ '^BAY( |$)' then return 'Plates starting with BAY are for traffic'; end if;
  if exists (select 1 from plates where plate = t and user_id <> me) then return 'taken'; end if;
  insert into plates (user_id, plate, updated_at) values (me, t, now()) on conflict (user_id) do update set plate = excluded.plate, updated_at = now();
  return 'ok';
exception when unique_violation then return 'taken';
end $$;
grant execute on function public.claim_plate(text) to authenticated;

-- ---------- player businesses ----------
create table if not exists public.player_businesses (
  id bigserial primary key,
  owner uuid not null references auth.users(id) on delete cascade,
  username text not null default '',
  type text not null check (type in ('tea', 'cafe', 'hotel', 'lodge')),
  name text not null check (length(name) between 1 and 28),
  x real not null, z real not null, h real not null default 0,
  lvl int not null default 0 check (lvl between 0 and 2),
  visits int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists player_businesses_owner on public.player_businesses (owner);
alter table public.player_businesses enable row level security;
drop policy if exists "businesses readable" on public.player_businesses;
create policy "businesses readable" on public.player_businesses for select using (true);
grant select on public.player_businesses to anon, authenticated;

-- open one: returns the new id, or a reason. Up to 10 per player, at least 20 m from any other business.
create or replace function public.open_business(p_type text, p_name text, p_x real, p_z real, p_h real) returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); nm text; un text; new_id bigint;
begin
  if me is null then return 'Sign in first'; end if;
  if p_type not in ('tea', 'cafe', 'hotel', 'lodge') then return 'Unknown business'; end if;
  nm := left(regexp_replace(coalesce(p_name, ''), '[<>]', '', 'g'), 28); if length(trim(nm)) = 0 then nm := 'My business'; end if;
  if (select count(*) from player_businesses where owner = me) >= 10 then return 'You can run up to 10 businesses'; end if;
  if exists (select 1 from player_businesses where (x - p_x) * (x - p_x) + (z - p_z) * (z - p_z) < 400) then return 'Another business is right here · move a little'; end if;
  select username into un from profiles where id = me;
  insert into player_businesses (owner, username, type, name, x, z, h) values (me, coalesce(un, ''), p_type, nm, p_x, p_z, coalesce(p_h, 0)) returning id into new_id;
  return new_id::text;
end $$;
grant execute on function public.open_business(text, text, real, real, real) to authenticated;

create or replace function public.upgrade_business(p_id bigint, p_lvl int) returns void language sql security definer set search_path = public as $$
  update player_businesses set lvl = least(greatest(p_lvl, 0), 2) where id = p_id and owner = auth.uid(); $$;
grant execute on function public.upgrade_business(bigint, int) to authenticated;

create or replace function public.close_business(p_id bigint) returns void language sql security definer set search_path = public as $$
  delete from player_businesses where id = p_id and owner = auth.uid(); $$;
grant execute on function public.close_business(bigint) to authenticated;

-- a visitor bought something (not counted for the owner's own visits; at most 1000 waiting)
create or replace function public.visit_business(p_id bigint) returns void language sql security definer set search_path = public as $$
  update player_businesses set visits = least(visits + 1, 1000) where id = p_id and owner <> auth.uid(); $$;
grant execute on function public.visit_business(bigint) to authenticated;

-- the owner collects: returns how many visits there were and sets the counter back to 0
create or replace function public.collect_visits(p_id bigint) returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update player_businesses b set visits = 0 from (select id, visits from player_businesses where id = p_id and owner = auth.uid() for update) o where b.id = o.id returning o.visits into n;
  return coalesce(n, 0);
end $$;
grant execute on function public.collect_visits(bigint) to authenticated;

-- keep the username on businesses up to date when a player renames
create or replace function public.biz_username() returns trigger language plpgsql security definer set search_path = public as $$
begin update player_businesses set username = new.username where owner = new.id; return new; end $$;
drop trigger if exists biz_username on public.profiles;
create trigger biz_username after update of username on public.profiles for each row execute function public.biz_username();
