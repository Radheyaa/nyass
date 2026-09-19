import { inputClass as input } from "@/lib/ui";
import { signIn, signUp, signInWithGoogle } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next = "/" } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-line bg-white/70 p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-saffron">Welcome</p>
        <h1 className="mt-2 font-display text-3xl">Sign in or join</h1>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}

        <form action={signInWithGoogle} className="mt-6">
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="btn btn-outline w-full">
            Continue with Google
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input name="email" type="email" placeholder="Email" required className={input} />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className={input}
          />
          <div className="flex gap-2 pt-1">
            <button formAction={signIn} className="btn btn-primary flex-1">
              Sign in
            </button>
            <button formAction={signUp} className="btn btn-outline flex-1">
              Create account
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
