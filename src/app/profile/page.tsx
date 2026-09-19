import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Enrollment } from "@/lib/supabase/types";

type CourseWithModules = {
  id: string;
  slug: string;
  title: string;
  modules: { id: string; title: string; display_order: number }[];
};

export const metadata = { title: "My learning" };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

export default async function ProfilePage() {
  if (!isSupabaseConfigured) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/profile")}`);

  const [{ data: courses }, { data: enrollments }, { data: progress }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, slug, title, modules(id, title, display_order)")
      .order("display_order")
      .returns<CourseWithModules[]>(),
    supabase
      .from("enrollments")
      .select("course_id, status")
      .eq("user_id", user.id)
      .returns<(Enrollment & { course_id: string })[]>(),
    supabase
      .from("module_progress")
      .select("module_id, completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .returns<{ module_id: string; completed_at: string }[]>(),
  ]);

  const completedAt = new Map(progress?.map((p) => [p.module_id, p.completed_at]));
  const status = new Map(enrollments?.map((e) => [e.course_id, e.status]));

  const myCourses = (courses ?? [])
    .map((course) => ({
      ...course,
      modules: [...course.modules].sort((a, b) => a.display_order - b.display_order),
    }))
    .filter((course) => status.has(course.id) || course.modules.some((m) => completedAt.has(m.id)));

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-saffron">Your journey</p>
      <h1 className="mt-3 font-display text-4xl">My learning</h1>
      <p className="mt-2 text-muted">{user.email}</p>

      {myCourses.length === 0 ? (
        <p className="mt-10 text-muted">
          You haven&apos;t started a course yet.{" "}
          <Link href="/#courses" className="text-saffron hover:underline">
            Explore the courses
          </Link>
        </p>
      ) : (
        <ul className="mt-10 space-y-6">
          {myCourses.map((course) => {
            const done = course.modules.filter((m) => completedAt.has(m.id));
            const percent = course.modules.length ? (done.length / course.modules.length) * 100 : 0;
            return (
              <li key={course.id} className="rounded-2xl border border-line bg-white/60 p-7">
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/${course.slug}`} className="font-display text-2xl hover:text-saffron">
                    {course.title}
                  </Link>
                  {status.get(course.id) && (
                    <span className="rounded-full border border-gold/60 px-3 py-0.5 text-xs capitalize text-gold">
                      {status.get(course.id)}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-muted">
                  {done.length} of {course.modules.length} modules complete
                </p>
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(percent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-2 h-2 overflow-hidden rounded-full bg-line"
                >
                  <div className="h-full bg-saffron" style={{ width: `${percent}%` }} />
                </div>

                {done.length > 0 && (
                  <ul className="mt-5 space-y-2 text-sm">
                    {course.modules.map((m, i) =>
                      completedAt.has(m.id) ? (
                        <li key={m.id} className="flex items-baseline gap-3">
                          <span aria-hidden className="text-saffron">
                            ✓
                          </span>
                          <Link href={`/${course.slug}/module-${i + 1}`} className="flex-1 hover:underline">
                            {m.title}
                          </Link>
                          <span className="text-muted">{formatDate(completedAt.get(m.id)!)}</span>
                        </li>
                      ) : null,
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
