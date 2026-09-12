-- Courses named in nyass_platform_plan.docx section 3 (URL structure).
-- Titles/descriptions are placeholders in English; replace with the real
-- Marathi copy via the Supabase Table Editor before launch.

insert into courses (slug, title, description, display_order) values
  ('dnyaneshwari', 'Dnyaneshwari', null, 1),
  ('gatha', 'Gatha', null, 2),
  ('dasbodh', 'Dasbodh', null, 3),
  ('vaidik-gnan', 'Vaidik Knowledge', null, 4),
  ('pravachane', 'Gondavalekar Maharaj Pravachane', null, 5),
  ('trainer-course', 'Trainer Course', 'Advanced course, unlocked after completing a base course.', 6);
