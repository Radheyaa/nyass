import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function isAuthor(supabase: Supabase, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
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
