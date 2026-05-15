"use client";

import { useState, useTransition } from "react";
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
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(totalPacks));
  const [saved, setSaved] = useState(totalPacks);
  const [, startTransition] = useTransition();

  const parsed = parseInt(value, 10);
  const valid = !isNaN(parsed) && parsed >= usedPacks && parsed >= 1;

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
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <span>
          Total Packs: <strong>{saved}</strong> ({usedPacks} used, {saved - usedPacks} remaining)
        </span>
        <button
          type="button"
          onClick={() => { setValue(String(saved)); setEditing(true); }}
          className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">Total Packs:</span>
      <input
        type="number"
        min={Math.max(1, usedPacks)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
        autoFocus
      />
      <button
        type="button"
        disabled={!valid}
        onClick={handleSave}
        className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-600"
      >
        Cancel
      </button>
      {!valid && value !== "" && (
        <span className="text-xs text-rose-600">Min: {Math.max(1, usedPacks)}</span>
      )}
    </div>
  );
}
