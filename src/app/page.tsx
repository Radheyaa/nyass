import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Course } from "@/lib/supabase/types";

export default async function Home() {
  let courses: Course[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("slug, title, description, display_order")
      .order("display_order")
      .returns<Course[]>();
    courses = data ?? [];
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#3a3780_0%,#24224f_55%,#171533_100%)] text-paper">
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          fill="none"
          stroke="#b8893b"
          strokeWidth="0.4"
          className="pointer-events-none absolute -right-48 -top-48 h-[44rem] w-[44rem] opacity-25"
        >
          {[20, 35, 50, 65, 80, 95].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${i * 15} 100 100)`} />
          ))}
        </svg>
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Wisdom Without Borders</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            The Universal Wisdom Academy
          </h1>
          <div className="my-8 h-px w-24 bg-gold" />
          <p className="max-w-2xl text-lg leading-8 text-paper/80">
            The Universal Wisdom Academy is a global home for lifelong learning that unites
            people of all ages to share and discover practical life wisdom. By bridging diverse
            generations and world perspectives, we empower people worldwide to lead meaningful
            and well-guided lives.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="#courses" className="btn btn-primary">
              Explore the courses
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-saffron">Courses</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Timeless teachings, at your own pace</h2>

        {courses.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <li key={course.slug}>
                <Link
                  href={`/${course.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white/60 p-7 transition hover:-translate-y-1 hover:border-gold hover:shadow-lg"
                >
                  <span className="font-display text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-2xl">{course.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                    {course.description ?? "Coming soon."}
                  </p>
                  <span className="mt-auto pt-6 text-sm font-medium text-saffron">
                    Explore <span className="inline-block transition group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-muted">
            {isSupabaseConfigured
              ? "No courses published yet."
              : "Connect a Supabase project and add its keys to .env.local to load courses here."}
          </p>
        )}
      </section>
    </main>
  );
}
