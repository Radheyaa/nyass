import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin" };

const tools = [
  {
    href: "/admin/learners",
    title: "Learners",
    description:
      "Search learners, see their progress, mark modules complete or incomplete, change enrollment status, and set roles.",
  },
];

export default async function AdminPage() {
  await requireAdmin("/admin");

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-saffron">Admin</p>
      <h1 className="mt-3 font-display text-4xl">Administration</h1>
      <p className="mt-2 text-muted">Tools for managing learners and the people who build the courses.</p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white/60 p-6 transition hover:-translate-y-1 hover:border-gold hover:shadow-lg"
            >
              <h2 className="font-display text-2xl">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{tool.description}</p>
              <span className="mt-auto pt-5 text-sm font-medium text-saffron">
                Open <span className="inline-block transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-muted">
        Building courses and modules?{" "}
        <Link href="/author" className="text-saffron hover:underline">
          Open the Author studio
        </Link>
        .
      </p>
    </main>
  );
}
