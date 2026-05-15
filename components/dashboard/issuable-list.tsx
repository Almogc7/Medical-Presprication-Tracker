"use client";

import { useId, useState, useTransition } from "react";
import { useLocale } from "@/components/ui/locale-provider";
import { Button } from "@/components/ui/button";
import { usePacksAction } from "@/app/actions";

type IssuableItem = {
  id: string;
  title: string;
  person: string;
  daysRemaining: string;
  totalPacks: number;
  usedPacks: number;
};

function UsePacksInline({ item }: { item: IssuableItem }) {
  const { t } = useLocale();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("1");
  const [, startTransition] = useTransition();

  const remaining = item.totalPacks - item.usedPacks;
  const parsed    = parseInt(value, 10);
  const valid     = !isNaN(parsed) && parsed >= 1 && parsed <= remaining;

  if (remaining <= 0) return null;

  if (!open) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="mt-2"
        aria-label={`Use packs for ${item.title}`}
        onClick={() => setOpen(true)}
      >
        {t.common.usePacks}
      </Button>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <label htmlFor={inputId} className="sr-only">
        {t.prescriptions.usePacksDescription} (max {remaining})
      </label>
      <input
        id={inputId}
        type="number"
        min={1}
        max={remaining}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={!valid && value !== "" ? "true" : undefined}
        className="w-16 rounded-[var(--radius-component)] border border-border bg-surface px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        autoFocus
      />
      <span className="text-xs text-slate-500" aria-hidden="true">/ {remaining}</span>
      <Button
        variant="primary"
        size="sm"
        disabled={!valid}
        onClick={() => {
          if (!valid) return;
          startTransition(async () => {
            await usePacksAction(item.id, parsed);
          });
          setOpen(false);
          setValue("1");
        }}
      >
        {t.common.confirm}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => { setOpen(false); setValue("1"); }}
      >
        {t.common.cancel}
      </Button>
    </div>
  );
}

export function IssuableList({
  items,
  urgent = false,
}: {
  items: IssuableItem[];
  urgent?: boolean;
}) {
  if (!items.length) return null;

  return (
    <div className="divide-y divide-border-subtle">
      {items.map((item) => (
        <div key={item.id} className="py-3 first:pt-0 last:pb-0">
          <p className={`font-medium ${urgent ? "text-status-danger" : "text-slate-900"}`}>
            {item.title}
          </p>
          <p className={`mt-0.5 text-sm ${urgent ? "text-status-danger" : "text-slate-600"}`}>
            {item.person}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500">
            {item.daysRemaining}
            <span aria-label={`${item.usedPacks} of ${item.totalPacks} packs used`}>
              {" · "}{item.usedPacks}/{item.totalPacks} packs
            </span>
          </p>
          <UsePacksInline item={item} />
        </div>
      ))}
    </div>
  );
}
