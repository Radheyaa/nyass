-- Initial schema for nyass.org learning platform
-- See nyass_platform_plan.docx section 4 (Data Model) and section 5 (Login & Access).

create type enrollment_status as enum ('interested', 'active', 'completed');
create type module_content_type as enum ('text', 'video');

create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  content_type module_content_type not null,
  video_url text,
  body text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status enrollment_status not null default 'interested',
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  completed_at timestamptz,
  unique (user_id, module_id)
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  pass_threshold numeric not null default 0.8,
  created_at timestamptz not null default now()
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  choices jsonb not null,
  correct_choice int not null,
  display_order int not null default 0
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  score numeric not null,
  passed boolean not null,
  attempted_at timestamptz not null default now()
);

-- Row-level security: users read only their own progress/profile data (plan section 5).
-- Course/module content is public-facing per plan section 6 (SEO); quizzes stay
-- authenticated-only so answers aren't publicly readable.

alter table courses enable row level security;
alter table modules enable row level security;
alter table enrollments enable row level security;
alter table module_progress enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;

create policy "courses are publicly readable" on courses
  for select using (true);

create policy "modules are publicly readable" on modules
  for select using (true);

create policy "users manage their own enrollments" on enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage their own module progress" on module_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "authenticated users read quizzes" on quizzes
  for select to authenticated using (true);

create policy "authenticated users read quiz questions" on quiz_questions
  for select to authenticated using (true);

create policy "users manage their own quiz attempts" on quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
