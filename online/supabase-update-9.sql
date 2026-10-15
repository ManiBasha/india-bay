-- India Bay online · update 9 (Beta v1.01.21)
-- Groups, profile totals, invite = friends, location sharing, events on stages, reports that silence players,
-- banned emails, more admins, removing unused accounts, dashboards, messages to the admin, photo-only BayGram.
-- Paste into Supabase → SQL Editor → New query, then Run. Safe to run more than once. Needs updates 1 to 8 first.

/* ===================== 1. Messages to the admin (Phone → Message admin) ===================== */
alter table public.suggestions add column if not exists kind text not null default 'suggestion';
alter table public.suggestions drop constraint if exists suggestions_text_check;
alter table public.suggestions add constraint suggestions_text_check check (length(text) <= 1000);
alter table public.suggestions add column if not exists status text not null default 'new';
drop policy if exists "admins update suggestions" on public.suggestions;
create policy "admins update suggestions" on public.suggestions for update to authenticated using (public.is_admin()) with check (public.is_admin());

/* ===================== 2. Bans, silences and the last time a player played ===================== */
create table if not exists public.banned_emails (
  email citext primary key,
  reason text not null default '',
  created_at timestamptz not null default now()
);
alter table public.banned_emails enable row level security;
drop policy if exists "admins read bans" on public.banned_emails;
create policy "admins read bans" on public.banned_emails for select to authenticated using (public.is_admin());

create or replace function public.is_banned_uid(p_uid uuid) returns boolean
language sql stable security definer set search_path = public, auth
as $$ select exists (select 1 from auth.users u join public.banned_emails b on b.email = u.email::citext where u.id = p_uid) $$;
create or replace function public.am_i_banned() returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_banned_uid(auth.uid()) $$;
grant execute on function public.am_i_banned() to authenticated;

-- a banned email cannot make a new player
drop policy if exists "create own profile" on public.profiles;
create policy "create own profile" on public.profiles for insert to authenticated with check (auth.uid() = id and not public.is_banned_uid(auth.uid()));

-- silences: chat, voice and calls switched off for a while after several players report someone
create table if not exists public.sanctions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  username text not null default '',
  level int not null default 1,
  until timestamptz not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists sanctions_user on public.sanctions (user_id, until desc);
alter table public.sanctions enable row level security;
drop policy if exists "see own or admin sanctions" on public.sanctions;
create policy "see own or admin sanctions" on public.sanctions for select to authenticated using (auth.uid() = user_id or public.is_admin());
drop policy if exists "admins change sanctions" on public.sanctions;
create policy "admins change sanctions" on public.sanctions for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins delete sanctions" on public.sanctions;
create policy "admins delete sanctions" on public.sanctions for delete to authenticated using (public.is_admin());

create or replace function public.silenced_until(p_uid uuid) returns timestamptz
language sql stable security definer set search_path = public
as $$ select max(until) from public.sanctions where user_id = p_uid and until > now() $$;

-- the game server asks this about each player (banned? silenced until when?)
create or replace function public.player_status(p_uid uuid) returns json
language sql stable security definer set search_path = public
as $$ select json_build_object('banned', public.is_banned_uid(p_uid), 'silenced', public.silenced_until(p_uid)) $$;
grant execute on function public.player_status(uuid) to anon, authenticated;
create or replace function public.my_status() returns json
language sql stable security definer set search_path = public
as $$ select public.player_status(auth.uid()) $$;
grant execute on function public.my_status() to authenticated;

-- reports: what kind, and about whom
alter table public.reports add column if not exists kind text not null default 'chat';
alter table public.reports add column if not exists target_id uuid references auth.users on delete set null;
alter table public.reports add column if not exists status text not null default 'new';

-- When 3 different players report someone within a day, chat, voice and calls stop for them: 5 hours the first time,
-- then 10, 15, 20 ... (5 hours more each time). Each new silence needs new reports after the last one ended.
create or replace function public.report_silence() returns trigger
language plpgsql security definer set search_path = public
as $$ declare t uuid; last_end timestamptz; n int; lv int; tn text; begin
  t := coalesce(new.target_id, (select id from profiles where username = new.target_name::citext));
  if t is null then return new; end if;
  if new.target_id is null then update reports set target_id = t where id = new.id; end if;
  if public.silenced_until(t) is not null then return new; end if;      -- already silenced
  select max(until) into last_end from sanctions where user_id = t;
  select count(distinct reporter) into n from reports
    where coalesce(target_id, (select id from profiles where username = reports.target_name::citext)) = t
      and created_at > greatest(now() - interval '1 day', coalesce(last_end, '-infinity'::timestamptz));
  if n >= 3 then
    select count(*) + 1 into lv from sanctions where user_id = t; select username into tn from profiles where id = t;
    insert into sanctions (user_id, username, level, until, reason) values (t, coalesce(tn, new.target_name), lv, now() + make_interval(hours => 5 * lv), n || ' players reported them');
  end if;
  return new;
end $$;
drop trigger if exists reports_silence on public.reports;
create trigger reports_silence after insert on public.reports for each row execute function public.report_silence();

-- last time the player played (for removing unused accounts); the game calls this every few minutes
alter table public.profiles add column if not exists last_seen timestamptz not null default now();
create or replace function public.touch_seen() returns json
language plpgsql security definer set search_path = public
as $$ begin update profiles set last_seen = now() where id = auth.uid(); return public.player_status(auth.uid()); end $$;
grant execute on function public.touch_seen() to authenticated;

/* ===================== 3. Admin tools: bans, admins, silences, testers ===================== */
create or replace function public.ban_email(p_email text, p_reason text) returns text
language plpgsql security definer set search_path = public
as $$ begin if not public.is_admin() then return 'not admin'; end if;
  if p_email !~ '^\S+@\S+\.\S+$' then return 'That is not an email address'; end if;
  insert into banned_emails (email, reason) values (lower(trim(p_email)), left(coalesce(p_reason, ''), 200)) on conflict (email) do update set reason = excluded.reason;
  return 'ok'; end $$;
create or replace function public.unban_email(p_email text) returns text
language plpgsql security definer set search_path = public
as $$ begin if not public.is_admin() then return 'not admin'; end if; delete from banned_emails where email = lower(trim(p_email))::citext; return 'ok'; end $$;
create or replace function public.list_bans() returns table (email text, reason text, created_at timestamptz, username text)
language sql stable security definer set search_path = public, auth
as $$ select b.email::text, b.reason, b.created_at, (select p.username::text from auth.users u join profiles p on p.id = u.id where u.email::citext = b.email limit 1)
  from banned_emails b where public.is_admin() order by b.created_at desc $$;
-- ban by username: finds their email
create or replace function public.ban_player(p_name text, p_reason text) returns text
language plpgsql security definer set search_path = public, auth
as $$ declare em text; begin if not public.is_admin() then return 'not admin'; end if;
  select u.email into em from profiles p join auth.users u on u.id = p.id where p.username = p_name::citext;
  if em is null then return 'That player has no email (a guest account) or does not exist'; end if;
  return public.ban_email(em, p_reason); end $$;

create or replace function public.add_admin(name text) returns text
language plpgsql security definer set search_path = public
as $$ declare u uuid; begin if not public.is_admin() then return 'not admin'; end if;
  select id into u from profiles where username = name::citext; if u is null then return 'no such username'; end if;
  insert into admins (user_id) values (u) on conflict do nothing; return 'ok'; end $$;
create or replace function public.remove_admin(name text) returns text
language plpgsql security definer set search_path = public
as $$ declare u uuid; begin if not public.is_admin() then return 'not admin'; end if;
  select id into u from profiles where username = name::citext; if u is null then return 'no such username'; end if;
  if u = auth.uid() then return 'You cannot remove yourself'; end if;
  if (select count(*) from admins) <= 1 then return 'The last admin cannot be removed'; end if;
  delete from admins where user_id = u; return 'ok'; end $$;
create or replace function public.list_admins() returns table (username text, email text)
language sql stable security definer set search_path = public, auth
as $$ select coalesce(p.username::text, '(no player yet)'), u.email::text from admins a join auth.users u on u.id = a.user_id left join profiles p on p.id = a.user_id where public.is_admin() order by 1 $$;

create or replace function public.list_sanctions() returns table (id bigint, username text, level int, until timestamptz, reason text, created_at timestamptz)
language sql stable security definer set search_path = public
as $$ select s.id, s.username, s.level, s.until, s.reason, s.created_at from sanctions s where public.is_admin() order by s.created_at desc limit 200 $$;
create or replace function public.silence_player(p_name text, p_hours int) returns text
language plpgsql security definer set search_path = public
as $$ declare u uuid; lv int; begin if not public.is_admin() then return 'not admin'; end if;
  select id into u from profiles where username = p_name::citext; if u is null then return 'no such username'; end if;
  if coalesce(p_hours, 0) <= 0 then update sanctions set until = now() where user_id = u and until > now(); return 'ok'; end if;
  select count(*) + 1 into lv from sanctions where user_id = u;
  insert into sanctions (user_id, username, level, until, reason) values (u, p_name, lv, now() + make_interval(hours => least(p_hours, 24 * 365)), 'Set by the admin'); return 'ok'; end $$;

revoke all on function public.ban_email(text, text), public.unban_email(text), public.list_bans(), public.ban_player(text, text), public.add_admin(text), public.remove_admin(text), public.list_admins(), public.list_sanctions(), public.silence_player(text, int) from public, anon;
grant execute on function public.ban_email(text, text), public.unban_email(text), public.list_bans(), public.ban_player(text, text), public.add_admin(text), public.remove_admin(text), public.list_admins(), public.list_sanctions(), public.silence_player(text, int) to authenticated;

/* ===================== 4. Texts and comments: stop when silenced or banned ===================== */
create or replace function public.can_talk() returns text
language sql stable security definer set search_path = public
as $$ select case when public.is_banned_uid(auth.uid()) then 'This account is banned'
  when public.silenced_until(auth.uid()) is not null then 'Chat, voice and calls are off for you until ' || to_char(public.silenced_until(auth.uid()) at time zone 'Asia/Kolkata', 'DD Mon HH24:MI') || ' (India time) after reports from other players'
  else null end $$;
grant execute on function public.can_talk() to authenticated;

create or replace function public.send_text(p_to text, p_body text) returns text
language plpgsql security definer set search_path = public
as $$ declare t uuid; tn text; me text; n int; c text; begin
  if not public.is_google_player() then return 'Sign in with Google to send texts'; end if;
  if coalesce((select (data->>'chatOn')::boolean from game_config where id = 1), true) = false then return 'Chat is paused by the admin'; end if;
  c := public.can_talk(); if c is not null then return c; end if;
  select id, username into t, tn from profiles where username = p_to::citext; if t is null then return 'No player with that username'; end if;
  if t = auth.uid() then return 'That is you'; end if;
  if exists (select 1 from blocks where user_id = t and blocked_id = auth.uid()) then return 'This player cannot get your texts'; end if;
  select count(*) into n from texts where from_id = auth.uid() and created_at > now() - interval '10 minutes';
  if n >= 30 then return 'Slow down: 30 texts in 10 minutes is the limit'; end if;
  select username into me from profiles where id = auth.uid();
  insert into texts (from_id, to_id, from_name, to_name, body) values (auth.uid(), t, me, tn, left(trim(p_body), 300));
  return 'ok';
end $$;
grant execute on function public.send_text(text, text) to authenticated;

create or replace function public.baygram_comment(p_post bigint, p_body text) returns text
language plpgsql security definer set search_path = public
as $$ declare me text; k int; c text; begin
  if not public.is_google_player() then return 'Sign in with Google to comment'; end if;
  if coalesce((select (data->>'chatOn')::boolean from game_config where id = 1), true) = false then return 'Comments and chat are paused by the admin'; end if;
  c := public.can_talk(); if c is not null then return c; end if;
  if not exists (select 1 from baygram_posts where id = p_post) then return 'That post is gone'; end if;
  select count(*) into k from baygram_comments where user_id = auth.uid() and created_at > now() - interval '10 minutes';
  if k >= 20 then return 'Slow down: 20 comments in 10 minutes is the limit'; end if;
  select username into me from profiles where id = auth.uid();
  insert into baygram_comments (post_id, user_id, username, body) values (p_post, auth.uid(), me, left(trim(p_body), 200));
  return 'ok';
end $$;
grant execute on function public.baygram_comment(bigint, text) to authenticated;

/* ===================== 5. BayGram: photos only, and profile totals that never go down ===================== */
create or replace function public.baygram_post(p_kind text, p_path text, p_caption text, p_place text, p_size int) returns bigint
language plpgsql security definer set search_path = public
as $$ declare n int; u text; new_id bigint; used bigint; r record; begin
  if not public.is_google_player() then raise exception 'Sign in with Google to post on BayGram'; end if;
  if public.is_banned_uid(auth.uid()) then raise exception 'This account is banned'; end if;
  if p_kind <> 'photo' then raise exception 'BayGram posts are photos'; end if;
  if split_part(p_path, '/', 1) <> auth.uid()::text then raise exception 'bad path'; end if;
  select count(*) into n from baygram_posts where user_id = auth.uid() and created_at > now() - interval '1 day';
  if n >= 5 then raise exception 'You can post 5 times a day. Try again tomorrow'; end if;
  select username into u from profiles where id = auth.uid(); if u is null then raise exception 'no profile'; end if;
  insert into baygram_posts (user_id, username, kind, path, caption, place, size)
  values (auth.uid(), u, 'photo', p_path, left(coalesce(p_caption, ''), 200), left(coalesce(p_place, ''), 60), greatest(0, least(coalesce(p_size, 0), 10485760))) returning id into new_id;
  select coalesce(sum(size), 0) into used from baygram_posts;
  if used > public.baygram_cap() then
    for r in select id, path, size from baygram_posts where id <> new_id order by created_at asc loop
      exit when used <= public.baygram_cap() * 0.9;
      insert into baygram_trash (path) values (r.path) on conflict do nothing;
      delete from baygram_posts where id = r.id; used := used - r.size;
    end loop;
  end if;
  return new_id;
end $$;
grant execute on function public.baygram_post(text, text, text, text, int) to authenticated;

create table if not exists public.player_stats (
  user_id uuid primary key references auth.users on delete cascade,
  posts_total int not null default 0,      -- every post they ever made
  likes_total int not null default 0,      -- every like their posts ever got
  comments_total int not null default 0    -- every comment their posts ever got
);
alter table public.player_stats enable row level security;
drop policy if exists "anyone reads stats" on public.player_stats;
create policy "anyone reads stats" on public.player_stats for select using (true);

create or replace function public.stat_bump(p_uid uuid, p_col text) returns void
language plpgsql security definer set search_path = public
as $$ begin if p_uid is null then return; end if;
  insert into player_stats (user_id) values (p_uid) on conflict do nothing;
  if p_col = 'posts' then update player_stats set posts_total = posts_total + 1 where user_id = p_uid;
  elsif p_col = 'likes' then update player_stats set likes_total = likes_total + 1 where user_id = p_uid;
  elsif p_col = 'comments' then update player_stats set comments_total = comments_total + 1 where user_id = p_uid; end if; end $$;
revoke all on function public.stat_bump(uuid, text) from public, anon, authenticated;
create or replace function public.stats_post() returns trigger language plpgsql security definer set search_path = public as $$ begin perform public.stat_bump(new.user_id, 'posts'); return new; end $$;
create or replace function public.stats_like() returns trigger language plpgsql security definer set search_path = public as $$ begin perform public.stat_bump((select user_id from baygram_posts where id = new.post_id), 'likes'); return new; end $$;
create or replace function public.stats_comment() returns trigger language plpgsql security definer set search_path = public as $$ begin perform public.stat_bump((select user_id from baygram_posts where id = new.post_id), 'comments'); return new; end $$;
drop trigger if exists stats_post on public.baygram_posts; create trigger stats_post after insert on public.baygram_posts for each row execute function public.stats_post();
drop trigger if exists stats_like on public.baygram_likes; create trigger stats_like after insert on public.baygram_likes for each row execute function public.stats_like();
drop trigger if exists stats_comment on public.baygram_comments; create trigger stats_comment after insert on public.baygram_comments for each row execute function public.stats_comment();
-- start the totals from what is there now (only once: when the table is still empty)
do $$ begin if not exists (select 1 from public.player_stats) then
  insert into public.player_stats (user_id, posts_total, likes_total, comments_total)
  select p.user_id, count(*), coalesce(sum(p.likes), 0), coalesce(sum(p.comments), 0) from public.baygram_posts p group by p.user_id on conflict do nothing;
end if; end $$;

create or replace function public.profile_stats(p_name text) returns json
language sql stable security definer set search_path = public
as $$ select json_build_object('friends', (select count(*) from contacts c where c.user_id = p.id), 'posts', coalesce(s.posts_total, 0), 'likes', coalesce(s.likes_total, 0), 'comments', coalesce(s.comments_total, 0))
  from profiles p left join player_stats s on s.user_id = p.id where p.username = p_name::citext $$;
grant execute on function public.profile_stats(text) to anon, authenticated;

/* ===================== 6. Invites: the friend who joins is your friend straight away ===================== */
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
  if made < now() - interval '3 days' then return 'old'; end if;
  insert into referrals (referee, referrer) values (auth.uid(), inviter);
  perform public.make_friends(auth.uid(), inviter);      -- Beta v1.01.21: invited = friends, both ways
  return 'ok';
end $$;
revoke all on function public.register_referral(text) from public, anon;
grant execute on function public.register_referral(text) to authenticated;

/* ===================== 7. Groups in BayGram: chat and group calls ===================== */
create table if not exists public.chat_groups (
  id bigint generated always as identity primary key,
  name text not null check (length(name) between 1 and 40),
  owner uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.group_members (
  group_id bigint not null references public.chat_groups on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  username text not null,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists group_members_user on public.group_members (user_id);
create table if not exists public.group_texts (
  id bigint generated always as identity primary key,
  group_id bigint not null references public.chat_groups on delete cascade,
  from_id uuid references auth.users on delete set null,
  from_name text not null,
  body text not null check (length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists group_texts_group on public.group_texts (group_id, created_at desc);
alter table public.chat_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_texts enable row level security;
create or replace function public.in_group(g bigint) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from group_members where group_id = g and user_id = auth.uid()) $$;
drop policy if exists "members see group" on public.chat_groups;
create policy "members see group" on public.chat_groups for select to authenticated using (public.in_group(id) or public.is_admin());
drop policy if exists "members see members" on public.group_members;
create policy "members see members" on public.group_members for select to authenticated using (public.in_group(group_id) or public.is_admin());
drop policy if exists "members read texts" on public.group_texts;
create policy "members read texts" on public.group_texts for select to authenticated using (public.in_group(group_id) or public.is_admin());

-- make a group with some of your friends (up to 20 people)
create or replace function public.create_group(p_name text, p_members text[]) returns bigint
language plpgsql security definer set search_path = public
as $$ declare g bigint; me text; n text; f uuid; k int := 0; begin
  if not public.is_google_player() then raise exception 'Sign in with Google to make groups'; end if;
  if (select count(*) from group_members where user_id = auth.uid()) >= 30 then raise exception 'You are in 30 groups already'; end if;
  select username into me from profiles where id = auth.uid();
  insert into chat_groups (name, owner) values (left(trim(coalesce(nullif(p_name, ''), 'My group')), 40), auth.uid()) returning id into g;
  insert into group_members (group_id, user_id, username) values (g, auth.uid(), me);
  foreach n in array coalesce(p_members, '{}') loop
    exit when k >= 19;
    select c.friend_id into f from contacts c join profiles p on p.id = c.friend_id where c.user_id = auth.uid() and p.username = n::citext;
    if f is not null then insert into group_members (group_id, user_id, username) select g, f, username from profiles where id = f on conflict do nothing; k := k + 1; end if;
  end loop;
  return g; end $$;
-- any member can add one of their own friends
create or replace function public.add_to_group(p_group bigint, p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; begin
  if not public.in_group(p_group) then return 'You are not in this group'; end if;
  if (select count(*) from group_members where group_id = p_group) >= 20 then return 'Groups can have up to 20 people'; end if;
  select c.friend_id into f from contacts c join profiles p on p.id = c.friend_id where c.user_id = auth.uid() and p.username = p_name::citext;
  if f is null then return 'Only your friends can be added'; end if;
  insert into group_members (group_id, user_id, username) select p_group, f, username from profiles where id = f on conflict do nothing; return 'ok'; end $$;
-- anyone can leave at any time; the last person out closes the group
create or replace function public.leave_group(p_group bigint) returns text
language plpgsql security definer set search_path = public
as $$ begin delete from group_members where group_id = p_group and user_id = auth.uid();
  if not exists (select 1 from group_members where group_id = p_group) then delete from chat_groups where id = p_group; end if; return 'ok'; end $$;
create or replace function public.rename_group(p_group bigint, p_name text) returns text
language plpgsql security definer set search_path = public
as $$ begin if not public.in_group(p_group) then return 'You are not in this group'; end if; update chat_groups set name = left(trim(p_name), 40) where id = p_group and length(trim(p_name)) > 0; return 'ok'; end $$;
create or replace function public.send_group_text(p_group bigint, p_body text) returns text
language plpgsql security definer set search_path = public
as $$ declare me text; n int; c text; begin
  if not public.in_group(p_group) then return 'You are not in this group'; end if;
  if coalesce((select (data->>'chatOn')::boolean from game_config where id = 1), true) = false then return 'Chat is paused by the admin'; end if;
  c := public.can_talk(); if c is not null then return c; end if;
  select count(*) into n from group_texts where from_id = auth.uid() and created_at > now() - interval '10 minutes';
  if n >= 40 then return 'Slow down: 40 group messages in 10 minutes is the limit'; end if;
  select username into me from profiles where id = auth.uid();
  insert into group_texts (group_id, from_id, from_name, body) values (p_group, auth.uid(), me, left(trim(p_body), 300)); return 'ok'; end $$;
create or replace function public.my_groups() returns table (id bigint, name text, members text[], last_body text, last_from text, last_at timestamptz)
language sql stable security definer set search_path = public
as $$ select g.id, g.name, array(select m2.username from group_members m2 where m2.group_id = g.id order by m2.joined_at),
    t.body, t.from_name, coalesce(t.created_at, g.created_at)
  from chat_groups g join group_members m on m.group_id = g.id and m.user_id = auth.uid()
  left join lateral (select body, from_name, created_at from group_texts where group_id = g.id order by created_at desc limit 1) t on true
  order by coalesce(t.created_at, g.created_at) desc $$;
revoke all on function public.create_group(text, text[]), public.add_to_group(bigint, text), public.leave_group(bigint), public.rename_group(bigint, text), public.send_group_text(bigint, text), public.my_groups() from public, anon;
grant execute on function public.create_group(text, text[]), public.add_to_group(bigint, text), public.leave_group(bigint), public.rename_group(bigint, text), public.send_group_text(bigint, text), public.my_groups() to authenticated;

/* ===================== 8. Location sharing with friends and groups ===================== */
create table if not exists public.loc_requests (
  from_id uuid not null references auth.users on delete cascade,   -- who asks
  to_id uuid not null references auth.users on delete cascade,     -- whose location
  from_name text not null, to_name text not null,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id)
);
create table if not exists public.loc_shares (
  owner_id uuid not null references auth.users on delete cascade,  -- whose location it is
  viewer_id uuid not null references auth.users on delete cascade, -- who may see it
  owner_name text not null, viewer_name text not null,
  mode text not null check (mode in ('always', 'once')),
  x real, z real, place text not null default '',                  -- for 'once': where they were
  created_at timestamptz not null default now(),
  primary key (owner_id, viewer_id)
);
create table if not exists public.player_locations (
  user_id uuid primary key references auth.users on delete cascade,
  username text not null,
  x real not null, z real not null, place text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.loc_requests enable row level security;
alter table public.loc_shares enable row level security;
alter table public.player_locations enable row level security;
drop policy if exists "see own location requests" on public.loc_requests;
create policy "see own location requests" on public.loc_requests for select to authenticated using (auth.uid() in (from_id, to_id));
drop policy if exists "remove own location requests" on public.loc_requests;
create policy "remove own location requests" on public.loc_requests for delete to authenticated using (auth.uid() in (from_id, to_id));
drop policy if exists "see own shares" on public.loc_shares;
create policy "see own shares" on public.loc_shares for select to authenticated using (auth.uid() in (owner_id, viewer_id));
drop policy if exists "remove own shares" on public.loc_shares;
create policy "remove own shares" on public.loc_shares for delete to authenticated using (auth.uid() in (owner_id, viewer_id));
drop policy if exists "write own location" on public.player_locations;
create policy "write own location" on public.player_locations for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "update own location" on public.player_locations;
create policy "update own location" on public.player_locations for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "remove own location" on public.player_locations;
create policy "remove own location" on public.player_locations for delete to authenticated using (auth.uid() = user_id);
drop policy if exists "see shared locations" on public.player_locations;
create policy "see shared locations" on public.player_locations for select to authenticated using (auth.uid() = user_id or exists (select 1 from public.loc_shares s where s.owner_id = user_id and s.viewer_id = auth.uid() and s.mode = 'always'));

create or replace function public.request_location(p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; n text; me text; begin
  if not public.is_google_player() then return 'Sign in with Google first'; end if;
  select id, username into f, n from profiles where username = p_name::citext; if f is null then return 'No player with that username'; end if;
  if not exists (select 1 from contacts where user_id = auth.uid() and friend_id = f) then return 'You can ask friends only'; end if;
  if exists (select 1 from loc_shares where owner_id = f and viewer_id = auth.uid() and mode = 'always') then return 'They already share their location with you'; end if;
  select username into me from profiles where id = auth.uid();
  insert into loc_requests (from_id, to_id, from_name, to_name) values (auth.uid(), f, me, n) on conflict (from_id, to_id) do update set created_at = now(); return 'sent'; end $$;
-- answer a request: 'always', 'once' or 'no'
create or replace function public.answer_location(p_name text, p_mode text, p_x real, p_z real, p_place text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; n text; me text; begin
  select id, username into f, n from profiles where username = p_name::citext; if f is null then return 'No player with that username'; end if;
  delete from loc_requests where from_id = f and to_id = auth.uid();
  if p_mode = 'no' then return 'ok'; end if;
  if p_mode not in ('always', 'once') then return 'bad'; end if;
  select username into me from profiles where id = auth.uid();
  insert into loc_shares (owner_id, viewer_id, owner_name, viewer_name, mode, x, z, place) values (auth.uid(), f, me, n, p_mode, p_x, p_z, left(coalesce(p_place, ''), 60))
    on conflict (owner_id, viewer_id) do update set mode = excluded.mode, x = excluded.x, z = excluded.z, place = excluded.place, created_at = now();
  if p_mode = 'always' then insert into player_locations (user_id, username, x, z, place) values (auth.uid(), me, p_x, p_z, left(coalesce(p_place, ''), 60)) on conflict (user_id) do update set x = excluded.x, z = excluded.z, place = excluded.place, updated_at = now(); end if;
  return 'ok'; end $$;
-- share with a friend without being asked, or with everyone in a group
create or replace function public.share_location(p_name text, p_mode text, p_x real, p_z real, p_place text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; begin
  select id into f from profiles where username = p_name::citext; if f is null then return 'No player with that username'; end if;
  if not exists (select 1 from contacts where user_id = auth.uid() and friend_id = f) then return 'You can share with friends only'; end if;
  return public.answer_location(p_name, p_mode, p_x, p_z, p_place); end $$;
create or replace function public.share_location_group(p_group bigint, p_mode text, p_x real, p_z real, p_place text) returns int
language plpgsql security definer set search_path = public
as $$ declare r record; n int := 0; me text; begin
  if not public.in_group(p_group) then return 0; end if; if p_mode not in ('always', 'once') then return 0; end if;
  select username into me from profiles where id = auth.uid();
  for r in select user_id, username from group_members where group_id = p_group and user_id <> auth.uid() loop
    insert into loc_shares (owner_id, viewer_id, owner_name, viewer_name, mode, x, z, place) values (auth.uid(), r.user_id, me, r.username, p_mode, p_x, p_z, left(coalesce(p_place, ''), 60))
      on conflict (owner_id, viewer_id) do update set mode = case when loc_shares.mode = 'always' then 'always' else excluded.mode end, x = excluded.x, z = excluded.z, place = excluded.place, created_at = now();
    n := n + 1; end loop;
  if p_mode = 'always' then insert into player_locations (user_id, username, x, z, place) values (auth.uid(), me, p_x, p_z, left(coalesce(p_place, ''), 60)) on conflict (user_id) do update set x = excluded.x, z = excluded.z, place = excluded.place, updated_at = now(); end if;
  return n; end $$;
revoke all on function public.request_location(text), public.answer_location(text, text, real, real, text), public.share_location(text, text, real, real, text), public.share_location_group(bigint, text, real, real, text) from public, anon;
grant execute on function public.request_location(text), public.answer_location(text, text, real, real, text), public.share_location(text, text, real, real, text), public.share_location_group(bigint, text, real, real, text) to authenticated;

/* ===================== 9. Events on stages ===================== */
create table if not exists public.events (
  id bigint generated always as identity primary key,
  host_id uuid not null references auth.users on delete cascade,
  host_name text not null,
  title text not null check (length(title) between 3 and 60),
  place text not null default '',
  x real not null, z real not null, rot real not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists events_live on public.events (ends_at desc);
create table if not exists public.event_performers (
  event_id bigint not null references public.events on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  username text not null,
  status text not null default 'asked' check (status in ('asked', 'ok', 'no')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
create table if not exists public.event_tips (
  id bigint generated always as identity primary key,
  event_id bigint references public.events on delete set null,
  from_id uuid references auth.users on delete set null, from_name text not null,
  to_id uuid not null references auth.users on delete cascade,
  amount int not null check (amount between 1 and 100000),
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists event_tips_to on public.event_tips (to_id, claimed);
alter table public.events enable row level security;
alter table public.event_performers enable row level security;
alter table public.event_tips enable row level security;
drop policy if exists "anyone sees events" on public.events;
create policy "anyone sees events" on public.events for select using (true);
drop policy if exists "anyone sees performers" on public.event_performers;
create policy "anyone sees performers" on public.event_performers for select using (true);
drop policy if exists "see own tips" on public.event_tips;
create policy "see own tips" on public.event_tips for select to authenticated using (auth.uid() in (from_id, to_id) or public.is_admin());

-- host an event: one place, one event at a time (no other live event within about 150 m); one live event per host
create or replace function public.host_event(p_title text, p_place text, p_x real, p_z real, p_rot real, p_minutes int) returns bigint
language plpgsql security definer set search_path = public
as $$ declare me text; new_id bigint; begin
  if not public.is_google_player() then raise exception 'Sign in with Google to host events'; end if;
  if public.can_talk() is not null then raise exception '%', public.can_talk(); end if;
  if exists (select 1 from events where host_id = auth.uid() and ends_at > now()) then raise exception 'You are already hosting an event · end it first'; end if;
  if exists (select 1 from events where ends_at > now() and abs(x - p_x) < 60 and abs(z - p_z) < 60) then raise exception 'Another event is on here right now · pick another spot'; end if;
  select username into me from profiles where id = auth.uid();
  insert into events (host_id, host_name, title, place, x, z, rot, ends_at) values (auth.uid(), me, left(trim(p_title), 60), left(coalesce(p_place, ''), 60), p_x, p_z, coalesce(p_rot, 0), now() + make_interval(mins => greatest(15, least(coalesce(p_minutes, 60), 180)))) returning events.id into new_id;
  insert into event_performers (event_id, user_id, username, status) values (new_id, auth.uid(), me, 'ok');
  return new_id; end $$;
create or replace function public.end_event(p_event bigint) returns text
language plpgsql security definer set search_path = public
as $$ begin update events set ends_at = now() where id = p_event and (host_id = auth.uid() or public.is_admin()) and ends_at > now(); return 'ok'; end $$;
create or replace function public.ask_to_perform(p_event bigint) returns text
language plpgsql security definer set search_path = public
as $$ declare me text; begin
  if not public.is_google_player() then return 'Sign in with Google to perform'; end if;
  if not exists (select 1 from events where id = p_event and ends_at > now()) then return 'This event has ended'; end if;
  select username into me from profiles where id = auth.uid();
  insert into event_performers (event_id, user_id, username) values (p_event, auth.uid(), me) on conflict (event_id, user_id) do update set status = case when event_performers.status = 'ok' then 'ok' else 'asked' end, created_at = now();
  return 'ok'; end $$;
create or replace function public.answer_performer(p_event bigint, p_name text, p_ok boolean) returns text
language plpgsql security definer set search_path = public
as $$ begin
  if not exists (select 1 from events where id = p_event and host_id = auth.uid()) then return 'Only the host can do that'; end if;
  update event_performers set status = case when p_ok then 'ok' else 'no' end where event_id = p_event and lower(username) = lower(p_name); return 'ok'; end $$;
-- tip the host (game money): the host collects tips with claim_tips
create or replace function public.event_tip(p_event bigint, p_amount int) returns text
language plpgsql security definer set search_path = public
as $$ declare h uuid; me text; n int; begin
  if auth.uid() is null then return 'Sign in first'; end if;
  select host_id into h from events where id = p_event and ends_at > now(); if h is null then return 'This event has ended'; end if;
  if h = auth.uid() then return 'That is your own event'; end if;
  if coalesce(p_amount, 0) < 1 or p_amount > 100000 then return 'Tips are ₹1 to ₹1,00,000'; end if;
  select count(*) into n from event_tips where from_id = auth.uid() and created_at > now() - interval '1 minute'; if n >= 10 then return 'Slow down'; end if;
  select username into me from profiles where id = auth.uid();
  insert into event_tips (event_id, from_id, from_name, to_id, amount) values (p_event, auth.uid(), coalesce(me, 'player'), h, p_amount); return 'ok'; end $$;
create or replace function public.claim_tips() returns table (total bigint, n bigint, names text)
language plpgsql security definer set search_path = public
as $$ begin return query with c as (update event_tips set claimed = true where to_id = auth.uid() and not claimed returning amount, from_name)
  select coalesce(sum(amount), 0)::bigint, count(*)::bigint, string_agg(distinct from_name, ', ') from c; end $$;
revoke all on function public.host_event(text, text, real, real, real, int), public.end_event(bigint), public.ask_to_perform(bigint), public.answer_performer(bigint, text, boolean), public.event_tip(bigint, int), public.claim_tips() from public, anon;
grant execute on function public.host_event(text, text, real, real, real, int), public.end_event(bigint), public.ask_to_perform(bigint), public.answer_performer(bigint, text, boolean), public.event_tip(bigint, int), public.claim_tips() to authenticated;

/* ===================== 10. Dashboards: who is playing, what is used, billboard views and clicks ===================== */
create table if not exists public.presence (
  user_id uuid primary key references auth.users on delete cascade,
  username text not null default '',
  is_guest boolean not null default false,
  female boolean,
  age_group text not null default '',
  state text not null default '', zone text not null default '',
  x real, z real,
  mode text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.presence enable row level security;
drop policy if exists "write own presence" on public.presence;
create policy "write own presence" on public.presence for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "update own presence" on public.presence;
create policy "update own presence" on public.presence for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "admins read presence" on public.presence;
create policy "admins read presence" on public.presence for select to authenticated using (public.is_admin());

create table if not exists public.usage_daily (
  day date not null default (now() at time zone 'Asia/Kolkata')::date,
  metric text not null check (length(metric) <= 40),
  n bigint not null default 0,
  primary key (day, metric)
);
alter table public.usage_daily enable row level security;
drop policy if exists "admins read usage" on public.usage_daily;
create policy "admins read usage" on public.usage_daily for select to authenticated using (public.is_admin());
-- the game adds its counts every few minutes: {"voice_s": 12, "texts": 3, ...}
create or replace function public.add_usage(p jsonb) returns void
language plpgsql security definer set search_path = public
as $$ declare k text; v bigint; d date := (now() at time zone 'Asia/Kolkata')::date; begin
  if auth.uid() is null or jsonb_typeof(p) <> 'object' then return; end if;
  for k, v in select key, least(greatest(coalesce((value #>> '{}')::numeric, 0), 0), 100000)::bigint from jsonb_each(p) limit 40 loop
    if k ~ '^[a-z0-9_]{1,40}$' and v > 0 then insert into usage_daily (day, metric, n) values (d, k, v) on conflict (day, metric) do update set n = usage_daily.n + excluded.n; end if;
  end loop; end $$;
grant execute on function public.add_usage(jsonb) to authenticated;

create table if not exists public.ad_stats (
  day date not null default (now() at time zone 'Asia/Kolkata')::date,
  sponsor text not null, ad text not null,
  views bigint not null default 0, clicks bigint not null default 0,
  primary key (day, sponsor, ad)
);
alter table public.ad_stats enable row level security;
drop policy if exists "admins read ad stats" on public.ad_stats;
create policy "admins read ad stats" on public.ad_stats for select to authenticated using (public.is_admin());
-- [{"s":"sponsor","a":"ad text","v":views,"c":clicks}, ...]
create or replace function public.add_ad_stats(p jsonb) returns void
language plpgsql security definer set search_path = public
as $$ declare r jsonb; d date := (now() at time zone 'Asia/Kolkata')::date; begin
  if auth.uid() is null or jsonb_typeof(p) <> 'array' then return; end if;
  for r in select * from jsonb_array_elements(p) limit 60 loop
    insert into ad_stats (day, sponsor, ad, views, clicks) values (d, left(coalesce(r->>'s', ''), 60), left(coalesce(r->>'a', ''), 120), least(greatest(coalesce((r->>'v')::int, 0), 0), 5000), least(greatest(coalesce((r->>'c')::int, 0), 0), 500))
      on conflict (day, sponsor, ad) do update set views = ad_stats.views + excluded.views, clicks = ad_stats.clicks + excluded.clicks;
  end loop; end $$;
grant execute on function public.add_ad_stats(jsonb) to authenticated;

/* ===================== 11. Removing accounts nobody uses ===================== */
-- Guest accounts are removed after 14 days without playing, Google accounts after 60 days. Runs every night (below),
-- or from Admin → Refresh → Remove unused accounts now. BayGram photos of removed players are cleared too.
create or replace function public.cleanup_inactive() returns int
language plpgsql security definer set search_path = public, auth
as $$ declare n int; begin
  if auth.uid() is not null and not public.is_admin() then return 0; end if;   -- the nightly job has no user; players cannot run it
  insert into baygram_trash (path) select p.path from baygram_posts p join profiles f on f.id = p.user_id
    where (f.is_guest and f.last_seen < now() - interval '14 days') or (not f.is_guest and f.last_seen < now() - interval '60 days') on conflict do nothing;
  with gone as (
    delete from auth.users u where u.id in (select id from profiles where (is_guest and last_seen < now() - interval '14 days') or (not is_guest and last_seen < now() - interval '60 days'))
      or (coalesce(u.is_anonymous, false) and not exists (select 1 from profiles where id = u.id) and u.created_at < now() - interval '14 days')
    returning 1)
  select count(*) into n from gone;
  return n; end $$;
revoke all on function public.cleanup_inactive() from public, anon;
grant execute on function public.cleanup_inactive() to authenticated;

-- the nightly run, about 2:45 am India time (needs the pg_cron extension; if this part fails, use the admin button instead)
do $$ begin
  begin create extension if not exists pg_cron; exception when others then raise notice 'pg_cron not available: %', sqlerrm; end;
  begin perform cron.unschedule('india-bay-cleanup'); exception when others then null; end;
  begin perform cron.schedule('india-bay-cleanup', '17 21 * * *', 'select public.cleanup_inactive()'); exception when others then raise notice 'Could not schedule the nightly cleanup: %', sqlerrm; end;
end $$;
