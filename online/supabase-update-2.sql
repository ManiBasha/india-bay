-- India Bay online · update 2: support messages and "delete my account".
-- Paste into Supabase → SQL Editor → New query, then Run. Safe to run more than once.

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
