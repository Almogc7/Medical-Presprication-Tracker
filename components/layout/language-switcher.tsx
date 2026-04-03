"use client";

import { useRouter } from "next/navigation";

import { useLocale } from "@/components/ui/locale-provider";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const router = useRouter();

  async function onLocaleChange(nextLocale: string) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });

    router.refresh();
  }

  return (
    <select
      value={locale}
      onChange={(event) => onLocaleChange(event.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
      aria-label="Language"
    >
      <option value="en">English</option>
      <option value="he">עברית</option>
    </select>
  );
}
