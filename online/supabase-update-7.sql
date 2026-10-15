-- India Bay online · update 7 (Beta v1.01.17): BayGram friends, friend requests and comments; admin switches for
-- chat and calls. Contacts become friends (both ways). Paste into Supabase → SQL Editor → New query, then Run.
-- Safe to run more than once. Needs update 6 first.

-- 1. Contacts are friends now: every existing contact is made mutual
insert into public.contacts (user_id, friend_id, friend_name)
select c.friend_id, c.user_id, p.username from public.contacts c join public.profiles p on p.id = c.user_id
on conflict (user_id, friend_id) do nothing;

-- 2. Friend requests
create table if not exists public.friend_requests (
  from_id uuid not null references auth.users on delete cascade,
  to_id uuid not null references auth.users on delete cascade,
  from_name text not null, to_name text not null,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id)
);
alter table public.friend_requests enable row level security;
drop policy if exists "see own requests" on public.friend_requests;
create policy "see own requests" on public.friend_requests for select to authenticated using (auth.uid() = from_id or auth.uid() = to_id);
drop policy if exists "remove own requests" on public.friend_requests;
create policy "remove own requests" on public.friend_requests for delete to authenticated using (auth.uid() = from_id or auth.uid() = to_id);

create or replace function public.make_friends(a uuid, b uuid) returns void
language sql security definer set search_path = public
as $$
  insert into contacts (user_id, friend_id, friend_name) select a, b, username from profiles where id = b on conflict (user_id, friend_id) do nothing;
  insert into contacts (user_id, friend_id, friend_name) select b, a, username from profiles where id = a on conflict (user_id, friend_id) do nothing;
  delete from friend_requests where (from_id = a and to_id = b) or (from_id = b and to_id = a);
$$;
revoke all on function public.make_friends(uuid, uuid) from public, anon, authenticated;

create or replace function public.friend_request(p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; n text; me text; k int; begin
  if not public.is_google_player() then return 'Sign in with Google to add friends'; end if;
  select id, username into f, n from profiles where username = p_name::citext;
  if f is null then return 'No player with that username'; end if;
  if f = auth.uid() then return 'That is you'; end if;
  if exists (select 1 from contacts where user_id = auth.uid() and friend_id = f) then return 'You are already friends'; end if;
  if exists (select 1 from blocks where user_id = f and blocked_id = auth.uid()) then return 'This player is not taking friend requests'; end if;
  -- they already asked you: that makes you friends
  if exists (select 1 from friend_requests where from_id = f and to_id = auth.uid()) then perform public.make_friends(auth.uid(), f); return 'friends'; end if;
  select count(*) into k from friend_requests where from_id = auth.uid() and created_at > now() - interval '1 day';
  if k >= 30 then return 'Slow down: 30 friend requests a day is the limit'; end if;
  select username into me from profiles where id = auth.uid();
  insert into friend_requests (from_id, to_id, from_name, to_name) values (auth.uid(), f, me, n) on conflict do nothing;
  return 'sent';
end $$;
grant execute on function public.friend_request(text) to authenticated;

create or replace function public.friend_accept(p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; begin
  select id into f from profiles where username = p_name::citext; if f is null then return 'No player with that username'; end if;
  if not exists (select 1 from friend_requests where from_id = f and to_id = auth.uid()) then return 'No request from this player'; end if;
  perform public.make_friends(auth.uid(), f); return 'ok';
end $$;
grant execute on function public.friend_accept(text) to authenticated;

create or replace function public.friend_remove(p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; begin
  select id into f from profiles where username = p_name::citext; if f is null then return 'No player with that username'; end if;
  delete from contacts where (user_id = auth.uid() and friend_id = f) or (user_id = f and friend_id = auth.uid());
  delete from friend_requests where (from_id = auth.uid() and to_id = f) or (from_id = f and to_id = auth.uid());
  return 'ok';
end $$;
grant execute on function public.friend_remove(text) to authenticated;

-- the old "add contact" now sends a friend request
create or replace function public.add_contact(p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare r text; begin r := public.friend_request(p_name); return case when r in ('sent', 'friends') then 'ok' else r end; end $$;
grant execute on function public.add_contact(text) to authenticated;

-- 3. Comments on BayGram posts
alter table public.baygram_posts add column if not exists comments int not null default 0;
create table if not exists public.baygram_comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.baygram_posts on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  username text not null,
  body text not null check (length(body) between 1 and 200),
  created_at timestamptz not null default now()
);
create index if not exists baygram_comments_post on public.baygram_comments (post_id, created_at);
alter table public.baygram_comments enable row level security;
drop policy if exists "read comments" on public.baygram_comments;
create policy "read comments" on public.baygram_comments for select using (true);
drop policy if exists "delete own comments" on public.baygram_comments;
create policy "delete own comments" on public.baygram_comments for delete to authenticated
  using (auth.uid() = user_id or public.is_admin() or exists (select 1 from public.baygram_posts p where p.id = post_id and p.user_id = auth.uid()));

create or replace function public.baygram_comment_count() returns trigger
language plpgsql security definer set search_path = public
as $$ begin
  if tg_op = 'INSERT' then update baygram_posts set comments = comments + 1 where id = new.post_id; return new; end if;
  update baygram_posts set comments = greatest(0, comments - 1) where id = old.post_id; return old;
end $$;
drop trigger if exists baygram_comments_count on public.baygram_comments;
create trigger baygram_comments_count after insert or delete on public.baygram_comments for each row execute function public.baygram_comment_count();

create or replace function public.baygram_comment(p_post bigint, p_body text) returns text
language plpgsql security definer set search_path = public
as $$ declare me text; k int; begin
  if not public.is_google_player() then return 'Sign in with Google to comment'; end if;
  if coalesce((select (data->>'chatOn')::boolean from game_config where id = 1), true) = false then return 'Comments and chat are paused by the admin'; end if;
  if not exists (select 1 from baygram_posts where id = p_post) then return 'That post is gone'; end if;
  select count(*) into k from baygram_comments where user_id = auth.uid() and created_at > now() - interval '10 minutes';
  if k >= 20 then return 'Slow down: 20 comments in 10 minutes is the limit'; end if;
  select username into me from profiles where id = auth.uid();
  insert into baygram_comments (post_id, user_id, username, body) values (p_post, auth.uid(), me, left(trim(p_body), 200));
  return 'ok';
end $$;
grant execute on function public.baygram_comment(bigint, text) to authenticated;

-- 4. Texts stop when the admin pauses chat (Admin → Game settings → Online and moderation)
create or replace function public.send_text(p_to text, p_body text) returns text
language plpgsql security definer set search_path = public
as $$ declare t uuid; tn text; me text; n int; begin
  if not public.is_google_player() then return 'Sign in with Google to send texts'; end if;
  if coalesce((select (data->>'chatOn')::boolean from game_config where id = 1), true) = false then return 'Chat is paused by the admin'; end if;
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
