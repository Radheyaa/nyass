import { signIn, signUp, signInWithGoogle } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next = "/" } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}

      <form action={signInWithGoogle} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="w-full rounded border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
        >
          Continue with Google
        </button>
      </form>

      <div className="my-6 text-center text-sm text-zinc-500">or</div>

      <form className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20"
        />
        <div className="flex gap-2">
          <button
            formAction={signIn}
            className="flex-1 rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Sign in
          </button>
          <button
            formAction={signUp}
            className="flex-1 rounded border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
          >
            Create account
          </button>
        </div>
      </form>
    </main>
  );
}
