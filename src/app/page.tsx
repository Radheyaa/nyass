import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Course } from "@/lib/supabase/types";

export default async function Home() {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-semibold">nyass.org</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Connect a Supabase project and add its keys to .env.local to load
          courses here.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("slug, title, description, display_order")
    .order("display_order")
    .returns<Course[]>();

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">nyass.org</h1>
      {courses && courses.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {courses.map((course) => (
            <li key={course.slug}>
              <Link href={`/${course.slug}`} className="text-lg font-medium underline">
                {course.title}
              </Link>
              {course.description && (
                <p lang="mr" className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {course.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No courses published yet.</p>
      )}
    </main>
  );
}
