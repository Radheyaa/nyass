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
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <svg
            aria-hidden
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            className="shrink-0 text-saffron"
          >
            <circle cx="16" cy="16" r="6" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="13" strokeWidth="0.8" />
            <path d="M16 3v6M16 23v6M3 16h6M23 16h6" strokeWidth="1.2" />
          </svg>
          <span className="font-display text-sm leading-tight sm:text-lg">
            The Universal Wisdom Academy
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/#courses" className="hidden text-muted hover:text-ink sm:inline">
            Courses
          </Link>
          {userEmail ? (
            <form action={signOut} className="flex items-center gap-3">
              <span className="hidden text-muted md:inline">{userEmail}</span>
              <button type="submit" className="btn btn-outline btn-sm">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
