import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { inputClass } from "@/lib/ui";
import type { AdminUser } from "@/lib/supabase/types";

export const metadata = { title: "Learners" };

export default async function LearnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase } = await requireAdmin("/admin/learners");

  const { data } = await supabase.rpc("admin_list_users", q ? { q } : {});
  const users = data as AdminUser[] | null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">
        ← Author studio
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-saffron">Admin</p>
      <h1 className="mt-3 font-display text-4xl">Learners</h1>

      <form className="mt-8 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by email"
          className={inputClass}
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {users && users.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {users.map((u) => (
            <li key={u.user_id}>
              <Link
                href={`/admin/learners/${u.user_id}`}
                className="flex items-center gap-4 rounded-xl border border-line bg-white/60 px-5 py-4 transition hover:border-gold hover:shadow-sm"
              >
                <span className="flex-1 truncate">{u.email}</span>
                {u.role && (
                  <span className="rounded-full border border-gold/60 px-3 py-0.5 text-xs capitalize text-gold">
                    {u.role}
                  </span>
                )}
                <span className="text-sm text-muted">
                  Joined {new Date(u.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">{q ? "No one matches that search." : "No users yet."}</p>
      )}
    </main>
  );
}
