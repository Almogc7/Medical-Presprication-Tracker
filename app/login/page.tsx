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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6" dir={dir}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{t.auth.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.auth.subtitle}</p>

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t.auth.email}</span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              defaultValue={adminEmail}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t.auth.password}</span>
            <input type="password" name="password" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          {params.error ? <p className="text-sm text-rose-600">{t.auth.invalid}</p> : null}

          <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">
            {t.auth.login}
          </button>
        </form>
      </div>
    </div>
  );
}
