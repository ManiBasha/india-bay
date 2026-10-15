-- India Bay online · update 8 (Beta v1.01.18): new username rules.
-- Usernames are now small letters a-z, numbers 0-9, "_" and "." (up to 15). Every existing username is changed
-- to small letters (Raju2026 becomes raju2026), everywhere it is stored. Nobody loses their name: usernames were
-- already unique without caring about capital letters.
-- Paste into Supabase → SQL Editor → New query, then Run. Safe to run more than once. Needs update 7 first.

-- 1. remove the old "letters and numbers, up to 10" rule (its name can differ, so find it)
do $$ declare c record; begin
  for c in select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%A-Za-z0-9%'
  loop execute format('alter table public.profiles drop constraint %I', c.conname); end loop;
end $$;

-- 2. small letters everywhere a username is kept
update public.profiles set username = lower(username::text) where username::text <> lower(username::text);
do $$ declare t record; begin
  for t in select * from (values ('contacts', 'friend_name'), ('friend_requests', 'from_name'), ('friend_requests', 'to_name'),
      ('texts', 'from_name'), ('texts', 'to_name'), ('baygram_posts', 'username'), ('baygram_comments', 'username'),
      ('reports', 'target_name'), ('reports', 'reporter_name')) v(tb, col)
  loop
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = t.tb and column_name = t.col) then
      execute format('update public.%I set %I = lower(%I) where %I <> lower(%I)', t.tb, t.col, t.col, t.col, t.col);
    end if;
  end loop;
end $$;

-- 3. the new rule: a-z, 0-9, "_" and ".", 1 to 15 long, no dot at the start or end, no ".."
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username::text ~ '^[a-z0-9_.]{1,15}$' and username::text !~ '^\.|\.$|\.\.');
