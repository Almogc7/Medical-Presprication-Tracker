"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setAllPacksForPersonAction } from "@/app/actions";

export function SetPacksForPerson({
  personId,
  prescriptionCount,
}: {
  personId: string;
  prescriptionCount: number;
}) {
  const inputId = useId();
  const [value, setValue]       = useState("");
  const [done, setDone]         = useState(false);
  const [, startTransition]     = useTransition();

  if (prescriptionCount === 0) return null;

  const parsed = parseInt(value, 10);
  const valid  = !isNaN(parsed) && parsed >= 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    startTransition(async () => {
      await setAllPacksForPersonAction(personId, parsed);
      setDone(true);
      setValue("");
    });
  }

  if (done) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mt-2 text-center text-xs text-status-healthy"
      >
        ✓ All {prescriptionCount} prescription{prescriptionCount > 1 ? "s" : ""} updated
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <label htmlFor={inputId} className="sr-only">
        Total packs for all prescriptions
      </label>
      <input
        id={inputId}
        type="number"
        min={1}
        placeholder="Packs"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded-[var(--radius-component)] border border-border bg-surface px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
      />
      <Button type="submit" variant="primary" size="sm" disabled={!valid}>
        Set all
      </Button>
    </form>
  );
}
