"use client";

import type { PrescriptionStatus } from "@/types/domain";

import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";
import { getExpirationSeverity } from "@/utils/date";

export function StatusBadge({
  status,
  expirationDate,
}: {
  status: PrescriptionStatus;
  expirationDate?: Date;
}) {
  const { t } = useLocale();

  const severe = expirationDate ? getExpirationSeverity(expirationDate) : "none";

  const classes =
    status === "active"
      ? severe !== "none" && severe !== "low"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "expired"
        ? "bg-rose-100 text-rose-700 border-rose-200"
        : "bg-slate-200 text-slate-700 border-slate-300";

  const label =
    status === "active"
      ? severe !== "none" && severe !== "low"
        ? t.status.expiringSoon
        : t.status.active
      : status === "expired"
        ? t.status.expired
        : t.status.issued;

  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", classes)}>{label}</span>;
}
