import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type Role = "author" | "admin";

export async function getRole(supabase: Supabase, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle<{ role: Role }>();
  return data?.role ?? null;
}

// Any role (author or admin) can build content.
export async function isAuthor(supabase: Supabase, userId: string) {
  return (await getRole(supabase, userId)) !== null;
}

export async function requireAdmin(next: string) {
  if (!isSupabaseConfigured) notFound();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if ((await getRole(supabase, user.id)) !== "admin") notFound();
  return { supabase, user };
}

// Non-authors get a 404 so the admin area isn't advertised.
export async function requireAuthor(next: string) {
  if (!isSupabaseConfigured) notFound();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!(await isAuthor(supabase, user.id))) notFound();
  return supabase;
}
