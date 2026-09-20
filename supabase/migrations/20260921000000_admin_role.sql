-- Admin role: everything an author can do, plus manage learners
-- (progress, enrollments, roles). Authors keep content-only access.

create function is_admin() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin');
$$;

revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;

create policy "admins manage all progress" on module_progress
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "admins manage all enrollments" on enrollments
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "admins manage roles" on user_roles
  for all to authenticated using (is_admin()) with check (is_admin());

-- Learners' emails live in auth.users, which the API can't read directly.
-- This returns rows only when the caller is an admin.
-- ponytail: capped at 200 rows with an email search; add paging if the user base outgrows it.
create function admin_list_users(q text default null, only_user uuid default null)
  returns table (user_id uuid, email text, created_at timestamptz, role text)
  language sql stable security definer set search_path = public
as $$
  select u.id, u.email::text, u.created_at, r.role
  from auth.users u
  left join public.user_roles r on r.user_id = u.id
  where is_admin()
    and (only_user is null or u.id = only_user)
    and (q is null or u.email ilike '%' || q || '%')
  order by u.created_at desc
  limit 200;
$$;

revoke all on function admin_list_users(text, uuid) from public;
grant execute on function admin_list_users(text, uuid) to authenticated;
