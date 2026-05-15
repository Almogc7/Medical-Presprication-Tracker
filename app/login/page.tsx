import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  const { t, dir } = await getDictionary();
  const params = await searchParams;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@prescription.local";

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6" dir={dir}>
      <div className="w-full max-w-md rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">{t.auth.title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{t.auth.subtitle}</p>

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <div className="flex flex-col gap-1 text-sm">
            <label htmlFor="login-email" className="font-medium text-foreground-muted">
              {t.auth.email}
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              required
              className="rounded-[var(--radius-component)] border border-border bg-canvas px-3 py-2 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              defaultValue={adminEmail}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <label htmlFor="login-password" className="font-medium text-foreground-muted">
              {t.auth.password}
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              required
              className="rounded-[var(--radius-component)] border border-border bg-canvas px-3 py-2 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {params.error ? (
            <p role="alert" className="text-sm text-status-danger">
              {t.auth.invalid}
            </p>
          ) : null}

          <button
            type="submit"
            className="h-12 w-full rounded-[var(--radius-component)] bg-accent px-4 font-semibold text-accent-fg transition-colors hover:bg-accent-hover active:bg-accent-hover"
          >
            {t.auth.login}
          </button>
        </form>
      </div>
    </div>
  );
}
