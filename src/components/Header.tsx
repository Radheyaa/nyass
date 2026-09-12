import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOut } from "@/app/login/actions";

export default async function Header() {
  let userEmail: string | null = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
      <Link href="/" className="font-semibold">
        nyass.org
      </Link>
      {userEmail ? (
        <form action={signOut} className="flex items-center gap-3 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">{userEmail}</span>
          <button type="submit" className="underline">
            Sign out
          </button>
        </form>
      ) : (
        <Link href="/login" className="text-sm underline">
          Sign in
        </Link>
      )}
    </header>
  );
}
