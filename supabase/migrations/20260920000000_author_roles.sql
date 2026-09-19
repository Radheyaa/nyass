-- Author/admin access for building course content.
-- Grant a role (run in the Supabase SQL editor, replacing the email):
--   insert into user_roles (user_id, role)
--   select id, 'author' from auth.users where email = 'writer@example.com';

create table user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('author', 'admin'))
);

alter table user_roles enable row level security;

create policy "users read their own role" on user_roles
  for select to authenticated using (auth.uid() = user_id);

-- security definer so policies on other tables can check the role
-- without needing read access to user_roles.
create function is_author() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from user_roles where user_id = auth.uid());
$$;

revoke all on function is_author() from public;
grant execute on function is_author() to anon, authenticated;

-- Drafts: new modules stay hidden from learners until published.
alter table modules add column published boolean not null default false;
update modules set published = true;

drop policy "modules are publicly readable" on modules;

create policy "published modules are readable" on modules
  for select using (published or is_author());

create policy "authors insert modules" on modules
  for insert to authenticated with check (is_author());

create policy "authors update modules" on modules
  for update to authenticated using (is_author()) with check (is_author());

create policy "authors delete modules" on modules
  for delete to authenticated using (is_author());

create policy "authors update courses" on courses
  for update to authenticated using (is_author()) with check (is_author());

-- Signed-out visitors may see module titles on course pages,
-- but not the lesson text or video link.
revoke select on modules from anon;
grant select (id, course_id, title, content_type, display_order, created_at, published)
  on modules to anon;
