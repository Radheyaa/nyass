import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Course, Module, Enrollment } from "@/lib/supabase/types";
import { enroll } from "./actions";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = await params;

  if (!isSupabaseConfigured) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, description, display_order")
    .eq("slug", slug)
    .single<Course>();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, content_type, display_order")
    .eq("course_id", course.id)
    .order("display_order")
    .returns<Module[]>();

  let completed = new Set<string>();
  if (user && modules && modules.length > 0) {
    const { data } = await supabase
      .from("module_progress")
      .select("module_id")
      .eq("user_id", user.id)
      .in("module_id", modules.map((m) => m.id))
      .returns<{ module_id: string }[]>();
    completed = new Set(data?.map((row) => row.module_id));
  }

  let enrollment: Enrollment | null = null;
  if (user) {
    const { data } = await supabase
      .from("enrollments")
      .select("status")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .maybeSingle<Enrollment>();
    enrollment = data;
  }

  return (
    <main>
      <section className="bg-[radial-gradient(ellipse_at_top_left,#3a3780_0%,#24224f_60%,#171533_100%)] text-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <Link href="/#courses" className="text-sm text-paper/70 hover:text-paper">
            ← All courses
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-gold">Course</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">{course.title}</h1>
          <div className="mt-8">
            {!user && (
              <Link href={`/login?next=${encodeURIComponent(`/${slug}`)}`} className="btn btn-primary">
                Sign in to enroll
              </Link>
            )}
            {user && !enrollment && (
              <form action={enroll.bind(null, course.id, slug)}>
                <button type="submit" className="btn btn-primary">
                  Enroll in this course
                </button>
              </form>
            )}
            {enrollment && (
              <p className="inline-block rounded-full border border-gold/60 px-4 py-1.5 text-sm capitalize text-gold">
                Enrolled · {enrollment.status}
              </p>
            )}
            {user && modules && modules.length > 0 && (
              <p className="mt-4 text-sm text-paper/70">
                {completed.size} of {modules.length} modules complete
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-14">
        {course.description && (
          <div className="space-y-5 text-lg leading-8 text-ink/85">
            {course.description.split(/\n\n+/).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        <h2 className="mt-14 font-display text-2xl">Modules</h2>
        {modules && modules.length > 0 ? (
          <ol className="mt-5 space-y-3">
            {modules.map((module, index) => (
              <li key={module.id}>
                <Link
                  href={`/${slug}/module-${index + 1}`}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-white/60 px-5 py-4 transition hover:border-gold hover:shadow-sm"
                >
                  <span className="w-8 font-display text-xl text-gold">
                    {completed.has(module.id) ? (
                      <span className="text-saffron" role="img" aria-label="Completed">
                        ✓
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="flex-1">{module.title}</span>
                  <span className="text-xs uppercase tracking-wider text-muted">
                    {module.content_type === "video" ? "Video" : "Reading"}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-muted">No modules published yet.</p>
        )}
      </div>
    </main>
  );
}
