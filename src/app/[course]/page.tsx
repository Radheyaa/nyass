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
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 lang="mr" className="text-3xl font-semibold">
        {course.title}
      </h1>
      {course.description && (
        <p lang="mr" className="mt-3 text-zinc-600 dark:text-zinc-400">
          {course.description}
        </p>
      )}

      <div className="mt-6">
        {!user && (
          <Link
            href={`/login?next=${encodeURIComponent(`/${slug}`)}`}
            className="inline-block rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Sign in to enroll
          </Link>
        )}
        {user && !enrollment && (
          <form action={enroll.bind(null, course.id, slug)}>
            <button
              type="submit"
              className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Enroll
            </button>
          </form>
        )}
        {enrollment && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enrollment status: {enrollment.status}
          </p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-medium">Modules</h2>
      {modules && modules.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {modules.map((module, index) => (
            <li key={module.id} lang="mr" className="text-zinc-700 dark:text-zinc-300">
              {index + 1}. {module.title}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No modules published yet.</p>
      )}
    </main>
  );
}
