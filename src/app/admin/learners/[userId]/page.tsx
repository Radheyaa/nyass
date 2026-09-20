import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { AdminUser } from "@/lib/supabase/types";
import { setEnrollmentStatus, setModuleComplete, setRole } from "../actions";

type CourseWithModules = {
  id: string;
  title: string;
  modules: { id: string; title: string; display_order: number }[];
};

const selectClass = "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-saffron";
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

export default async function LearnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { userId } = await params;
  const { error, saved } = await searchParams;
  const { supabase, user: me } = await requireAdmin(`/admin/learners/${userId}`);

  const { data: found } = await supabase.rpc("admin_list_users", { only_user: userId });
  const learner = (found as AdminUser[] | null)?.[0];
  if (!learner) notFound();

  const [{ data: courses }, { data: enrollments }, { data: progress }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, modules(id, title, display_order)")
      .order("display_order")
      .returns<CourseWithModules[]>(),
    supabase
      .from("enrollments")
      .select("course_id, status")
      .eq("user_id", userId)
      .returns<{ course_id: string; status: string }[]>(),
    supabase
      .from("module_progress")
      .select("module_id, completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .returns<{ module_id: string; completed_at: string }[]>(),
  ]);

  const status = new Map(enrollments?.map((e) => [e.course_id, e.status]));
  const completedAt = new Map(progress?.map((p) => [p.module_id, p.completed_at]));
  const isSelf = me.id === userId;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/admin/learners" className="text-sm text-muted hover:text-ink">
        ← All learners
      </Link>
      <h1 className="mt-6 break-all font-display text-3xl sm:text-4xl">{learner.email}</h1>
      <p className="mt-2 text-sm text-muted">Joined {fmt(learner.created_at)}</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-700">Saved.</p>}

      <section className="mt-10 rounded-2xl border border-line bg-white/60 p-6">
        <h2 className="font-display text-xl">Role</h2>
        <form action={setRole.bind(null, userId)} className="mt-4 flex flex-wrap items-center gap-3">
          <select name="role" defaultValue={learner.role ?? "learner"} disabled={isSelf} className={selectClass}>
            <option value="learner">Learner</option>
            <option value="author">Author</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={isSelf} className="btn btn-primary btn-sm disabled:opacity-40">
            Save role
          </button>
        </form>
        <p className="mt-3 text-xs text-muted">
          {isSelf
            ? "You can't change your own role."
            : "Authors can build courses and modules. Admins can also manage learners and roles."}
        </p>
      </section>

      <h2 className="mt-12 font-display text-2xl">Courses and progress</h2>
      <div className="mt-5 space-y-4">
        {courses?.map((course) => {
          const modules = [...course.modules].sort((a, b) => a.display_order - b.display_order);
          const doneCount = modules.filter((m) => completedAt.has(m.id)).length;
          return (
            <details
              key={course.id}
              id={`c-${course.id}`}
              open={status.has(course.id) || doneCount > 0}
              className="rounded-2xl border border-line bg-white/60 p-6"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4">
                <span className="font-display text-xl">{course.title}</span>
                <span className="text-sm text-muted">
                  {doneCount} of {modules.length} complete
                </span>
              </summary>

              <form
                action={setEnrollmentStatus.bind(null, userId, course.id)}
                className="mt-5 flex flex-wrap items-center gap-3"
              >
                <span className="text-sm">Enrollment</span>
                <select name="status" defaultValue={status.get(course.id) ?? "none"} className={selectClass}>
                  <option value="none">Not enrolled</option>
                  <option value="interested">Interested</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <button type="submit" className="btn btn-outline btn-sm">
                  Save
                </button>
              </form>

              {modules.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {modules.map((m, i) => {
                    const at = completedAt.get(m.id);
                    return (
                      <li key={m.id} id={`m-${m.id}`} className="flex items-center gap-3 text-sm">
                        <span className="w-6 font-display text-lg text-gold">
                          {at ? <span className="text-saffron">✓</span> : i + 1}
                        </span>
                        <span className="flex-1">{m.title}</span>
                        {at && <span className="text-muted">{fmt(at)}</span>}
                        <form action={setModuleComplete.bind(null, userId, m.id, !at)}>
                          <button type="submit" className="btn btn-outline btn-sm">
                            {at ? "Mark incomplete" : "Mark complete"}
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              )}
            </details>
          );
        })}
      </div>
    </main>
  );
}
