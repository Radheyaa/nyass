import Link from "next/link";
import { getRole, requireAuthor } from "@/lib/auth";

export const metadata = { title: "Author studio" };

export default async function AdminPage() {
  const supabase = await requireAuthor("/admin");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user ? (await getRole(supabase, user.id)) === "admin" : false;

  const { data: courses } = await supabase
    .from("courses")
    .select("slug, title, modules(id)")
    .order("display_order")
    .returns<{ slug: string; title: string; modules: { id: string }[] }[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-saffron">Author studio</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Courses</h1>
        {isAdmin && (
          <Link href="/admin/learners" className="btn btn-outline btn-sm">
            Manage learners →
          </Link>
        )}
      </div>
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
