"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const STATUSES = ["interested", "active", "completed"];
const ROLES = ["author", "admin"];

const done = (userId: string, anchor = "") => redirect(`/admin/learners/${userId}?saved=1${anchor}`);
const fail = (userId: string, message: string): never =>
  redirect(`/admin/learners/${userId}?error=${encodeURIComponent(message)}`);

export async function setModuleComplete(userId: string, moduleId: string, complete: boolean) {
  const { supabase } = await requireAdmin(`/admin/learners/${userId}`);

  const { error } = complete
    ? await supabase.from("module_progress").upsert(
        { user_id: userId, module_id: moduleId, completed_at: new Date().toISOString() },
        { onConflict: "user_id,module_id", ignoreDuplicates: true },
      )
    : await supabase.from("module_progress").delete().eq("user_id", userId).eq("module_id", moduleId);

  if (error) fail(userId, error.message);
  done(userId, `#m-${moduleId}`);
}

export async function setEnrollmentStatus(userId: string, courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin(`/admin/learners/${userId}`);
  const status = String(formData.get("status"));

  const { error } =
    status === "none"
      ? await supabase.from("enrollments").delete().eq("user_id", userId).eq("course_id", courseId)
      : STATUSES.includes(status)
        ? await supabase
            .from("enrollments")
            .upsert({ user_id: userId, course_id: courseId, status }, { onConflict: "user_id,course_id" })
        : { error: { message: "Unknown status." } };

  if (error) fail(userId, error.message);
  done(userId, `#c-${courseId}`);
}

export async function setRole(userId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin(`/admin/learners/${userId}`);
  if (user.id === userId) fail(userId, "You can't change your own role.");

  const role = String(formData.get("role"));
  const { error } =
    role === "learner"
      ? await supabase.from("user_roles").delete().eq("user_id", userId)
      : ROLES.includes(role)
        ? await supabase.from("user_roles").upsert({ user_id: userId, role })
        : { error: { message: "Unknown role." } };

  if (error) fail(userId, error.message);
  done(userId);
}
