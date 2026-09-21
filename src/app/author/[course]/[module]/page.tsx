import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthor } from "@/lib/auth";
import { inputClass } from "@/lib/ui";
import type { Course, Module } from "@/lib/supabase/types";
import { deleteModule, saveModule } from "../../actions";

export default async function AdminModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ course: string; module: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { course: slug, module: moduleId } = await params;
  const { error, saved } = await searchParams;
  const supabase = await requireAuthor(`/author/${slug}/${moduleId}`);

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, description, display_order")
    .eq("slug", slug)
    .single<Course>();
  if (!course) notFound();

  const isNew = moduleId === "new";
  let module: Module | null = null;
  let nextOrder = 1;

  if (isNew) {
    const { data } = await supabase
      .from("modules")
      .select("display_order")
      .eq("course_id", course.id)
      .order("display_order", { ascending: false })
      .limit(1)
      .returns<{ display_order: number }[]>();
    nextOrder = (data?.[0]?.display_order ?? 0) + 1;
  } else {
    const { data } = await supabase
      .from("modules")
      .select("id, title, content_type, video_url, body, published, display_order")
      .eq("id", moduleId)
      .eq("course_id", course.id)
      .maybeSingle<Module>();
    if (!data) notFound();
    module = data;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={`/author/${slug}`} className="text-sm text-muted hover:text-ink">
        ← {course.title}
      </Link>
      <h1 className="mt-6 font-display text-4xl">{isNew ? "New module" : "Edit module"}</h1>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-700">Saved.</p>}

      <form action={saveModule.bind(null, course.id, slug, moduleId)} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input name="title" required defaultValue={module?.title} className={`mt-1 ${inputClass}`} />
        </label>

        <label className="block">
          <span className="text-sm font-medium">YouTube video link</span>
          <span className="ml-2 text-xs text-muted">Optional. Unlisted videos work fine.</span>
          <input
            name="video_url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            defaultValue={module?.video_url ?? ""}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Lesson text</span>
          <textarea
            name="body"
            rows={20}
            defaultValue={module?.body ?? ""}
            className={`mt-1 ${inputClass}`}
          />
          <span className="mt-1 block text-xs text-muted">
            Blank line = new paragraph. Start a paragraph with <code>## </code> for a heading,{" "}
            <code>&gt; </code> for a verse, or <code>- </code> per line for a bullet list. Marathi
            typing works as normal.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-8">
          <label className="block">
            <span className="text-sm font-medium">Order</span>
            <input
              name="display_order"
              type="number"
              min={1}
              defaultValue={module?.display_order ?? nextOrder}
              className={`mt-1 w-24 ${inputClass}`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="published"
              type="checkbox"
              defaultChecked={module?.published ?? false}
              className="h-4 w-4 accent-[#c4581a]"
            />
            Published (visible to learners)
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          {isNew ? "Create module" : "Save module"}
        </button>
      </form>

      {!isNew && (
        <details className="mt-14 border-t border-line pt-6">
          <summary className="cursor-pointer text-sm text-red-700">Delete this module</summary>
          <form action={deleteModule.bind(null, slug, moduleId)} className="mt-4">
            <p className="text-sm text-muted">
              This permanently removes the module and every learner&apos;s completion record for it.
            </p>
            <button type="submit" className="btn btn-outline mt-3 text-red-700">
              Yes, delete permanently
            </button>
          </form>
        </details>
      )}
    </main>
  );
}
