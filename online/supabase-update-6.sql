-- India Bay online · update 6 (Beta v1.01.03): BayGram, friends (calls and texts) and the date-of-birth lock.
-- Players post photos and short clips they took inside the game (photo mode or the Camera app) to a shared feed,
-- like posts, and report or delete them. Files live in a public Storage bucket "baygram", one folder per player.
-- Only Google accounts (not guests) can post, at most 5 posts a day. When BayGram storage passes the limit
-- (800 MB by default, see baygram_cap) the oldest posts are removed automatically. Admins can delete any post.
-- Paste into Supabase → SQL Editor → New query, then Run. Safe to run more than once.

-- files of posts removed to free space; any player's game deletes them from Storage, then clears the row
create table if not exists public.baygram_trash (path text primary key, added_at timestamptz not null default now());
alter table public.baygram_trash enable row level security;

-- the bucket: public read, 10 MB per file, pictures and video only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('baygram', 'baygram', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'video/webm', 'video/mp4'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/webm', 'video/mp4'];

create or replace function public.is_google_player() returns boolean
language sql stable security definer set search_path = public, auth
as $$ select exists (select 1 from auth.users where id = auth.uid() and coalesce(is_anonymous, false) = false) $$;
grant execute on function public.is_google_player() to authenticated;

drop policy if exists "baygram upload own folder" on storage.objects;
create policy "baygram upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'baygram' and (storage.foldername(name))[1] = auth.uid()::text and public.is_google_player());
drop policy if exists "baygram delete own or admin" on storage.objects;
create policy "baygram delete own or admin" on storage.objects for delete to authenticated
  using (bucket_id = 'baygram' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()
    or exists (select 1 from public.baygram_trash t where t.path = name)));

-- posts
create table if not exists public.baygram_posts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  username text not null,
  kind text not null check (kind in ('photo', 'video')),
  path text not null check (length(path) <= 200),
  caption text not null default '' check (length(caption) <= 200),
  place text not null default '' check (length(place) <= 60),
  likes int not null default 0,
  size int not null default 0 check (size between 0 and 10485760),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists baygram_posts_created on public.baygram_posts (created_at desc);
alter table public.baygram_posts enable row level security;
drop policy if exists "read visible posts" on public.baygram_posts;
create policy "read visible posts" on public.baygram_posts for select using (not hidden or auth.uid() = user_id or public.is_admin());
drop policy if exists "delete own or admin posts" on public.baygram_posts;
create policy "delete own or admin posts" on public.baygram_posts for delete to authenticated using (auth.uid() = user_id or public.is_admin());
drop policy if exists "admin hides posts" on public.baygram_posts;
create policy "admin hides posts" on public.baygram_posts for update to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.baygram_posts add column if not exists size int not null default 0;

create or replace function public.baygram_cap() returns bigint language sql immutable as $$ select 800::bigint * 1024 * 1024 $$;

create table if not exists public.baygram_likes (
  post_id bigint not null references public.baygram_posts on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  primary key (post_id, user_id)
);
alter table public.baygram_likes enable row level security;
drop policy if exists "see own likes" on public.baygram_likes;
create policy "see own likes" on public.baygram_likes for select to authenticated using (auth.uid() = user_id);

-- create a post (after uploading the file to your own folder): checks the account, the path and the daily limit
drop function if exists public.baygram_post(text, text, text, text);
create or replace function public.baygram_post(p_kind text, p_path text, p_caption text, p_place text, p_size int) returns bigint
language plpgsql security definer set search_path = public
as $$ declare n int; u text; new_id bigint; used bigint; r record; begin
  if not public.is_google_player() then raise exception 'Sign in with Google to post on BayGram'; end if;
  if p_kind not in ('photo', 'video') then raise exception 'bad kind'; end if;
  if split_part(p_path, '/', 1) <> auth.uid()::text then raise exception 'bad path'; end if;
  select count(*) into n from baygram_posts where user_id = auth.uid() and created_at > now() - interval '1 day';
  if n >= 5 then raise exception 'You can post 5 times a day. Try again tomorrow'; end if;
  select username into u from profiles where id = auth.uid(); if u is null then raise exception 'no profile'; end if;
  insert into baygram_posts (user_id, username, kind, path, caption, place, size)
  values (auth.uid(), u, p_kind, p_path, left(coalesce(p_caption, ''), 200), left(coalesce(p_place, ''), 60), greatest(0, least(coalesce(p_size, 0), 10485760))) returning id into new_id;
  -- free space: remove the oldest posts until storage is under 90% of the cap
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

create or replace function public.baygram_trash_list() returns setof text
language sql security definer set search_path = public
as $$ select path from baygram_trash order by added_at limit 50 $$;
grant execute on function public.baygram_trash_list() to authenticated;
create or replace function public.baygram_trash_done(p_paths text[]) returns void
language sql security definer set search_path = public, storage
as $$ delete from public.baygram_trash t where t.path = any(p_paths) and not exists (select 1 from storage.objects o where o.bucket_id = 'baygram' and o.name = t.path) $$;
grant execute on function public.baygram_trash_done(text[]) to authenticated;

-- like or unlike; returns the new like count
create or replace function public.baygram_like(p_post bigint) returns int
language plpgsql security definer set search_path = public
as $$ declare c int; begin
  if auth.uid() is null then raise exception 'sign in'; end if;
  if exists (select 1 from baygram_likes where post_id = p_post and user_id = auth.uid()) then
    delete from baygram_likes where post_id = p_post and user_id = auth.uid(); update baygram_posts set likes = greatest(0, likes - 1) where id = p_post returning likes into c;
  else
    insert into baygram_likes (post_id, user_id) values (p_post, auth.uid()); update baygram_posts set likes = likes + 1 where id = p_post returning likes into c;
  end if;
  return coalesce(c, 0);
end $$;
grant execute on function public.baygram_like(bigint) to authenticated;

-- Date of birth: entered once, then it cannot be changed (name and username still can). Admins can correct it.
create or replace function public.keep_dob() returns trigger
language plpgsql security definer set search_path = public
as $$ begin
  if old.dob is not null and new.dob is distinct from old.dob and not public.is_admin() then new.dob := old.dob; end if;
  return new;
end $$;
drop trigger if exists keep_dob on public.profile_private;
create trigger keep_dob before update on public.profile_private for each row execute function public.keep_dob();

-- Phone: contacts, texts and blocks (calls go live through the game server and are never stored).
-- Only Google accounts can add contacts, text and call. At most 30 texts in 10 minutes.
create table if not exists public.contacts (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  friend_id uuid not null references auth.users on delete cascade,
  friend_name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);
alter table public.contacts enable row level security;
drop policy if exists "own contacts" on public.contacts;
create policy "own contacts" on public.contacts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "delete own contacts" on public.contacts;
create policy "delete own contacts" on public.contacts for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.blocks (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  blocked_id uuid not null references auth.users on delete cascade,
  primary key (user_id, blocked_id)
);
alter table public.blocks enable row level security;
drop policy if exists "own blocks" on public.blocks;
create policy "own blocks" on public.blocks for select to authenticated using (auth.uid() = user_id);
drop policy if exists "delete own blocks" on public.blocks;
create policy "delete own blocks" on public.blocks for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.texts (
  id bigint generated always as identity primary key,
  from_id uuid not null references auth.users on delete cascade,
  to_id uuid not null references auth.users on delete cascade,
  from_name text not null, to_name text not null,
  body text not null check (length(body) between 1 and 300),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists texts_to on public.texts (to_id, created_at desc);
create index if not exists texts_from on public.texts (from_id, created_at desc);
alter table public.texts enable row level security;
drop policy if exists "read own texts" on public.texts;
create policy "read own texts" on public.texts for select to authenticated using (auth.uid() = from_id or auth.uid() = to_id);
drop policy if exists "delete own texts" on public.texts;
create policy "delete own texts" on public.texts for delete to authenticated using (auth.uid() = from_id or auth.uid() = to_id);

create or replace function public.add_contact(p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; n text; begin
  if not public.is_google_player() then return 'Sign in with Google to add contacts'; end if;
  select id, username into f, n from profiles where username = p_name::citext;
  if f is null then return 'No player with that username'; end if;
  if f = auth.uid() then return 'That is you'; end if;
  insert into contacts (user_id, friend_id, friend_name) values (auth.uid(), f, n) on conflict (user_id, friend_id) do update set friend_name = excluded.friend_name;
  return 'ok';
end $$;
grant execute on function public.add_contact(text) to authenticated;

create or replace function public.block_player(p_name text) returns text
language plpgsql security definer set search_path = public
as $$ declare f uuid; begin
  select id into f from profiles where username = p_name::citext; if f is null then return 'No player with that username'; end if;
  insert into blocks (user_id, blocked_id) values (auth.uid(), f) on conflict do nothing;
  delete from contacts where user_id = auth.uid() and friend_id = f;
  return 'ok';
end $$;
grant execute on function public.block_player(text) to authenticated;

create or replace function public.send_text(p_to text, p_body text) returns text
language plpgsql security definer set search_path = public
as $$ declare t uuid; tn text; me text; n int; begin
  if not public.is_google_player() then return 'Sign in with Google to send texts'; end if;
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

create or replace function public.read_texts(p_from text) returns void
language sql security definer set search_path = public
as $$ update texts set read_at = now() where to_id = auth.uid() and read_at is null and from_name = p_from $$;
grant execute on function public.read_texts(text) to authenticated;
