"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTotalPacksAction } from "@/app/actions";

export function EditTotalPacks({
  prescriptionId,
  totalPacks,
  usedPacks,
}: {
  prescriptionId: string;
  totalPacks: number;
  usedPacks: number;
}) {
  const inputId         = useId();
  const [editing, setEditing]       = useState(false);
  const [value, setValue]           = useState(String(totalPacks));
  const [saved, setSaved]           = useState(totalPacks);
  const [, startTransition]         = useTransition();

  const parsed = parseInt(value, 10);
  const valid  = !isNaN(parsed) && parsed >= usedPacks && parsed >= 1;
  const error  = value !== "" && !valid
    ? `Minimum ${Math.max(1, usedPacks)} (current usage)`
    : undefined;

  function handleSave() {
    if (!valid) return;
    startTransition(async () => {
      await updateTotalPacksAction(prescriptionId, parsed);
      setSaved(parsed);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <span>
          Total Packs: <strong className="tabular-nums text-foreground">{saved}</strong>
          <span className="ml-1 text-foreground-subtle">
            ({usedPacks} used, {saved - usedPacks} remaining)
          </span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => { setValue(String(saved)); setEditing(true); }}
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      <Input
        id={inputId}
        label="Total Packs"
        type="number"
        min={Math.max(1, usedPacks)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={error}
        className="w-28"
        autoFocus
      />
      <div className="flex items-end gap-2 self-end pb-px">
        <Button variant="primary" size="sm" disabled={!valid} onClick={handleSave}>
          Save
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
