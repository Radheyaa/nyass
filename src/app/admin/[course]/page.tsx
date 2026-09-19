import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthor } from "@/lib/auth";
import { inputClass } from "@/lib/ui";
import type { Course, Module } from "@/lib/supabase/types";
import { saveCourse } from "../actions";

export default async function AdminCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ course: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { course: slug } = await params;
  const { error, saved } = await searchParams;
  const supabase = await requireAuthor(`/admin/${slug}`);

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, description, display_order")
    .eq("slug", slug)
    .single<Course>();
  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, content_type, published, display_order")
    .eq("course_id", course.id)
    .order("display_order")
    .order("created_at")
    .returns<Module[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">
        ← All courses
      </Link>
      <div className="mt-6 flex items-end justify-between gap-4">
        <h1 className="font-display text-4xl">{course.title}</h1>
        <Link href={`/${slug}`} className="text-sm text-saffron hover:underline">
          View course page →
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-700">Saved.</p>}

      <form action={saveCourse.bind(null, course.id, slug)} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Course title</span>
          <input name="title" required defaultValue={course.title} className={`mt-1 ${inputClass}`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <span className="ml-2 text-xs text-muted">Leave a blank line between paragraphs.</span>
          <textarea
            name="description"
            rows={10}
            defaultValue={course.description ?? ""}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Save course
        </button>
      </form>

      <div className="mt-14 flex items-center justify-between">
        <h2 className="font-display text-2xl">Modules</h2>
        <Link href={`/admin/${slug}/new`} className="btn btn-primary btn-sm">
          Add module
        </Link>
      </div>

      {modules && modules.length > 0 ? (
        <ol className="mt-5 space-y-3">
          {modules.map((module, index) => (
            <li
              key={module.id}
              className="flex items-center gap-4 rounded-xl border border-line bg-white/60 px-5 py-4"
            >
              <span className="w-6 font-display text-xl text-gold">{index + 1}</span>
              <Link href={`/admin/${slug}/${module.id}`} className="flex-1 hover:text-saffron">
                {module.title}
              </Link>
              <span
                className={`rounded-full border px-3 py-0.5 text-xs ${
                  module.published ? "border-gold/60 text-gold" : "border-line text-muted"
                }`}
              >
                {module.published ? "Published" : "Draft"}
              </span>
              <Link href={`/${slug}/module-${index + 1}`} className="text-sm text-saffron hover:underline">
                View
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-muted">No modules yet. Add the first one.</p>
      )}
    </main>
  );
}
