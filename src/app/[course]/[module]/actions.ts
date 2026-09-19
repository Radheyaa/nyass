"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completeModule(moduleId: string, slug: string, moduleSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // ignoreDuplicates keeps the original completed_at if clicked twice.
  await supabase.from("module_progress").upsert(
    { user_id: user.id, module_id: moduleId, completed_at: new Date().toISOString() },
    { onConflict: "user_id,module_id", ignoreDuplicates: true },
  );

  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/${moduleSlug}`);
}
