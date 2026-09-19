import Link from "next/link";
import { requireAuthor } from "@/lib/auth";

export const metadata = { title: "Author studio" };

export default async function AdminPage() {
  const supabase = await requireAuthor("/admin");

  const { data: courses } = await supabase
    .from("courses")
    .select("slug, title, modules(id)")
    .order("display_order")
    .returns<{ slug: string; title: string; modules: { id: string }[] }[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-saffron">Author studio</p>
      <h1 className="mt-3 font-display text-4xl">Courses</h1>
      <p className="mt-2 text-muted">Choose a course to edit its description or build its modules.</p>

      <ul className="mt-10 space-y-3">
        {courses?.map((course) => (
          <li key={course.slug}>
            <Link
              href={`/admin/${course.slug}`}
              className="flex items-center justify-between rounded-xl border border-line bg-white/60 px-5 py-4 transition hover:border-gold hover:shadow-sm"
            >
              <span className="font-display text-xl">{course.title}</span>
              <span className="text-sm text-muted">
                {course.modules.length} {course.modules.length === 1 ? "module" : "modules"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
