"use server";

import { redirect } from "next/navigation";
import { requireAuthor } from "@/lib/auth";
import { youtubeEmbedUrl } from "@/lib/youtube";

// Browsers submit textarea line breaks as \r\n; the lesson renderer splits on \n.
const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").replace(/\r\n?/g, "\n").trim();
const withError = (path: string, message: string) =>
  `${path}?error=${encodeURIComponent(message)}`;

export async function saveCourse(courseId: string, slug: string, formData: FormData) {
  const supabase = await requireAuthor(`/author/${slug}`);
  const { error } = await supabase
    .from("courses")
    .update({ title: text(formData, "title"), description: text(formData, "description") || null })
    .eq("id", courseId);
  redirect(error ? withError(`/author/${slug}`, error.message) : `/author/${slug}?saved=1`);
}

// moduleId is a module uuid, or "new" to create one.
export async function saveModule(
  courseId: string,
  slug: string,
  moduleId: string,
  formData: FormData,
) {
  const supabase = await requireAuthor(`/author/${slug}`);
  const back = `/author/${slug}/${moduleId}`;

  const videoUrl = text(formData, "video_url");
  if (videoUrl && !youtubeEmbedUrl(videoUrl)) {
    redirect(withError(back, "That doesn't look like a YouTube link."));
  }

  const fields = {
    title: text(formData, "title"),
    content_type: videoUrl ? "video" : "text",
    video_url: videoUrl || null,
    body: text(formData, "body") || null,
    display_order: Number(formData.get("display_order")) || 0,
    published: formData.get("published") === "on",
  };

  const { data, error } =
    moduleId === "new"
      ? await supabase.from("modules").insert({ ...fields, course_id: courseId }).select("id").single()
      : await supabase.from("modules").update(fields).eq("id", moduleId).select("id").single();

  if (error || !data) redirect(withError(back, error?.message ?? "Save failed."));
  redirect(`/author/${slug}/${data.id}?saved=1`);
}

export async function deleteModule(slug: string, moduleId: string) {
  const supabase = await requireAuthor(`/author/${slug}`);
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  redirect(error ? withError(`/author/${slug}/${moduleId}`, error.message) : `/author/${slug}`);
}
