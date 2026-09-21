export const metadata = { title: "Privacy Policy" };

const CONTACT_EMAIL = "omrmom@gmail.com";

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "What we collect",
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Account details:</strong> your email address and a password (stored in scrambled
          form; we cannot read it). If you sign in with Google, we also receive the basic profile
          information Google shares, such as your name, email address and profile picture.
        </li>
        <li>
          <strong>Learning activity:</strong> the courses you enrol in and the modules you mark as
          complete, with dates.
        </li>
        <li>
          <strong>Sign-in cookie:</strong> a small cookie that keeps you signed in. We do not use
          advertising or tracking cookies.
        </li>
      </ul>
    ),
  },
  {
    heading: "How we use it",
    body: (
      <p>
        To create and secure your account, show your progress, and let our administrators help you,
        for example by correcting a module that was marked complete by mistake. We do not sell your
        information and we do not use it for advertising.
      </p>
    ),
  },
  {
    heading: "Who can see it",
    body: (
      <p>
        Only our administrators can see learner email addresses and progress. Course authors can
        edit course content but cannot see learner information. We rely on these services to run the
        site, and they process your data on our behalf: Supabase (accounts and database, hosted in
        Singapore), Vercel (website hosting), and Google (only if you choose Google sign-in).
      </p>
    ),
  },
  {
    heading: "Videos",
    body: (
      <p>
        Some lessons include YouTube videos. When you play one, YouTube may set its own cookies and
        collect information under Google&apos;s privacy policy.
      </p>
    ),
  },
  {
    heading: "Keeping and deleting your data",
    body: (
      <p>
        We keep your account and progress for as long as you have an account. To see, correct or
        delete your data, email us at the address below and we will act on your request.
      </p>
    ),
  },
  {
    heading: "Children",
    body: (
      <p>
        Learners of all ages are welcome, but young children should use the site with a parent or
        guardian. If you believe a child has created an account without permission, contact us and we
        will remove it.
      </p>
    ),
  },
  {
    heading: "Changes",
    body: <p>If we change this policy we will update the date at the top of this page.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-saffron">The Universal Wisdom Academy</p>
      <h1 className="mt-3 font-display text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated 21 September 2026</p>

      <p className="mt-8 text-lg leading-8 text-ink/85">
        We respect your privacy. This page explains, in plain language, what information the
        Academy collects and how it is used.
      </p>

      <div className="mt-10 space-y-9 leading-7 text-ink/85">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 font-display text-2xl text-ink">{section.heading}</h2>
            {section.body}
          </section>
        ))}

        <section>
          <h2 className="mb-3 font-display text-2xl text-ink">Contact</h2>
          <p>
            Questions or requests about your data:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-saffron hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
