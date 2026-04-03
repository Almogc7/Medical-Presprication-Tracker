"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";

const items = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/people", key: "people" as const },
  { href: "/upload", key: "upload" as const },
  { href: "/notifications", key: "notifications" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 md:w-64 md:border-b-0 md:border-r">
      <h2 className="mb-4 px-2 text-lg font-semibold text-slate-900">{t.appName}</h2>
      <nav className="flex flex-row gap-2 md:flex-col">
        {items.map((item) => {
          const label = t.sidebar[item.key];
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
