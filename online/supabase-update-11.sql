-- India Bay · Supabase update 11 (Beta v1.01.26)
-- Run once in Supabase → SQL Editor, after update 10. Safe to run again.
--   • rename your business (the new name shows on the sign and the map for everyone)

create or replace function public.rename_business(p_id bigint, p_name text) returns text language plpgsql security definer set search_path = public as $$
declare nm text;
begin
  if auth.uid() is null then return 'Sign in first'; end if;
  nm := left(regexp_replace(coalesce(p_name, ''), '[<>]', '', 'g'), 28);
  if length(trim(nm)) = 0 then return 'Type a name'; end if;
  update player_businesses set name = trim(nm) where id = p_id and owner = auth.uid();
  if not found then return 'Not your business'; end if;
  return 'ok';
end $$;
grant execute on function public.rename_business(bigint, text) to authenticated;
