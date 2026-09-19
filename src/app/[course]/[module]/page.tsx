import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Course, Module } from "@/lib/supabase/types";
import { completeModule } from "./actions";

function youtubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    if (!id) return null;
    const start = parseInt(u.searchParams.get("t") ?? "", 10);
    return `https://www.youtube-nocookie.com/embed/${id}${start > 0 ? `?start=${start}` : ""}`;
  } catch {
    return null;
  }
}

// Body is plain text: blank line = new block; "## " heading, "> " verse, "- " list.
function Body({ text }: { text: string }) {
  return text.split(/\n\n+/).map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="pt-4 font-display text-2xl">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          lang="mr"
          className="border-l-2 border-saffron bg-white/60 px-6 py-4 text-xl leading-9"
        >
          {block.slice(2)}
        </blockquote>
      );
    }
    if (block.startsWith("- ")) {
      return (
        <ul key={i} className="list-disc space-y-2 pl-6">
          {block.split("\n").map((line, j) => (
            <li key={j}>{line.slice(2)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} lang={/[ऀ-ॿ]/.test(block) ? "mr" : undefined}>
        {block}
      </p>
    );
  });
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ course: string; module: string }>;
}) {
  const { course: slug, module: moduleSlug } = await params;

  const match = /^module-(\d+)$/.exec(moduleSlug);
  if (!match || !isSupabaseConfigured) notFound();
  const number = Number(match[1]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/${slug}/${moduleSlug}`)}`);

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, description, display_order")
    .eq("slug", slug)
    .single<Course>();
  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, content_type, video_url, body, display_order")
    .eq("course_id", course.id)
    .order("display_order")
    .returns<Module[]>();

  const module = modules?.[number - 1];
  if (!module) notFound();

  const embedUrl = module.video_url ? youtubeEmbedUrl(module.video_url) : null;
  const total = modules!.length;

  const { data: progress } = await supabase
    .from("module_progress")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("module_id", module.id)
    .maybeSingle<{ completed_at: string | null }>();
  const done = Boolean(progress?.completed_at);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href={`/${slug}`} className="text-sm text-muted hover:text-ink">
        ← {course.title}
      </Link>
      <p className="mt-8 text-xs uppercase tracking-[0.3em] text-saffron">
        Module {number} of {total}
      </p>
      <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{module.title}</h1>

      {embedUrl && (
        <div className="mt-8 aspect-video overflow-hidden rounded-2xl bg-indigo shadow-lg">
          <iframe
            src={embedUrl}
            title={module.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}

      {module.body && (
        <div className="mt-10 space-y-5 text-lg leading-8 text-ink/85">
          <Body text={module.body} />
        </div>
      )}

      <div className="mt-12">
        {done ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-5 py-2 text-sm font-medium text-saffron">
            <span aria-hidden>✓</span> Module completed
          </p>
        ) : (
          <form action={completeModule.bind(null, module.id, slug, moduleSlug)}>
            <button type="submit" className="btn btn-primary">
              Mark module as complete
            </button>
          </form>
        )}
      </div>

      <nav className="mt-10 flex justify-between border-t border-line pt-6 text-sm">
        {number > 1 ? (
          <Link href={`/${slug}/module-${number - 1}`} className="text-saffron hover:underline">
            ← Previous module
          </Link>
        ) : (
          <span />
        )}
        {number < total && (
          <Link href={`/${slug}/module-${number + 1}`} className="text-saffron hover:underline">
            Next module →
          </Link>
        )}
      </nav>
    </main>
  );
}
