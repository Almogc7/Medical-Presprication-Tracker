"use client";

import Link from "next/link";
import { useId, useState } from "react";

import type { PrescriptionStatus } from "@/types/domain";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLocale } from "@/components/ui/locale-provider";
import { resolvePdfHref } from "@/utils/pdf-path";

type Row = {
  id: string;
  title: string;
  status: PrescriptionStatus;
  startDate: string;
  expirationDate: string;
  expirationDateValue: string;
  daysRemaining: string;
  pdfPath: string;
  totalPacks: number;
  usedPacks: number;
};

// ── UsePacksDialog — accessible via Dialog primitive ────────────────────────
function UsePacksDialog({
  open,
  remaining,
  prescriptionTitle,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  remaining: number;
  prescriptionTitle: string;
  onConfirm: (packs: number) => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const inputId = useId();
  const [value, setValue] = useState("1");

  const parsed = parseInt(value, 10);
  const valid  = !isNaN(parsed) && parsed >= 1 && parsed <= remaining;
  const error  = value !== "" && !valid ? t.prescriptions.usePacksInvalid : undefined;

  function handleConfirm() {
    if (!valid) return;
    onConfirm(parsed);
    setValue("1");
  }

  return (
    <Dialog
      open={open}
      onClose={() => { onCancel(); setValue("1"); }}
      title={t.prescriptions.usePacksTitle}
      description={`${prescriptionTitle} · ${remaining} ${t.prescriptions.packsRemaining}`}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <Input
          id={inputId}
          label={t.prescriptions.usePacksDescription}
          type="number"
          min={1}
          max={remaining}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={error}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { onCancel(); setValue("1"); }}>
            {t.common.cancel}
          </Button>
          <Button variant="primary" disabled={!valid} onClick={handleConfirm}>
            {t.common.confirm}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// ── PrescriptionTable ────────────────────────────────────────────────────────
export function PrescriptionTable({
  rows,
  onUsePacks,
  onUndoIssued,
  onDelete,
}: {
  rows: Row[];
  onUsePacks: (id: string, packs: number) => Promise<void>;
  onUndoIssued: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useLocale();
  const [packTargetId,  setPackTargetId]  = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const packTarget = rows.find((r) => r.id === packTargetId) ?? null;
  const remaining  = packTarget ? packTarget.totalPacks - packTarget.usedPacks : 0;

  function renderPackBadge(row: Row) {
    const rem = row.totalPacks - row.usedPacks;
    return (
      <span className="text-xs text-foreground-muted" aria-label={`${row.usedPacks ?? 0} of ${row.totalPacks ?? 0} packs used`}>
        {row.usedPacks}/{row.totalPacks}
        {rem > 0 && row.status !== "issued" ? ` · ${rem} left` : ""}
      </span>
    );
  }

  function renderActions(row: Row, stacked = false) {
    const rem = row.totalPacks - row.usedPacks;
    return (
      <div className={stacked ? "grid gap-2 sm:flex sm:flex-wrap" : "flex flex-wrap gap-2"}>
        <Link
          href={resolvePdfHref(row.pdfPath)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View PDF for ${row.title}`}
          className="inline-flex h-11 items-center rounded-[var(--radius-component)] border border-border px-3 text-xs text-foreground transition-colors hover:bg-border-subtle"
        >
          {t.common.viewPdf}
        </Link>

        {row.status !== "issued" && rem > 0 ? (
          <Button
            variant="primary"
            size="sm"
            aria-label={`Use packs for ${row.title}`}
            onClick={() => setPackTargetId(row.id)}
          >
            {t.common.usePacks}
          </Button>
        ) : row.status === "issued" ? (
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Undo issued for ${row.title}`}
            onClick={() => onUndoIssued(row.id)}
          >
            {t.common.undoIssued}
          </Button>
        ) : null}

        <Link
          href={`/prescriptions/${row.id}`}
          aria-label={`View details for ${row.title}`}
          className="inline-flex h-11 items-center rounded-[var(--radius-component)] border border-border px-3 text-xs text-foreground transition-colors hover:bg-border-subtle"
        >
          {t.common.actions}
        </Link>

        <Button
          variant="danger"
          size="sm"
          aria-label={`Delete ${row.title}`}
          onClick={() => setDeleteTargetId(row.id)}
        >
          {t.common.delete}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile cards ──────────────────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-[var(--radius-panel)] border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-medium text-foreground">{row.title}</p>
                <div className="mt-1">{renderPackBadge(row)}</div>
                <div className="mt-2">
                  <StatusBadge status={row.status} expirationDate={new Date(row.expirationDateValue)} />
                </div>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">{t.prescriptions.table.startDate}</dt>
                <dd className="mt-1 text-foreground-muted">{row.startDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">{t.prescriptions.table.expirationDate}</dt>
                <dd className="mt-1 text-foreground-muted">{row.expirationDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">{t.prescriptions.table.daysRemaining}</dt>
                <dd className="mt-1 text-foreground-muted">{row.daysRemaining}</dd>
              </div>
            </dl>
            <div className="mt-4">{renderActions(row, true)}</div>
          </div>
        ))}
      </div>

      {/* ── Desktop table ─────────────────────────────────────────────────── */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-panel)] border border-border bg-surface shadow-sm md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-border-subtle text-left text-foreground-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t.prescriptions.table.title}</th>
              <th className="px-4 py-3 font-medium">{t.prescriptions.table.status}</th>
              <th className="px-4 py-3 font-medium">{t.prescriptions.totalPacks}</th>
              <th className="px-4 py-3 font-medium">{t.prescriptions.table.startDate}</th>
              <th className="px-4 py-3 font-medium">{t.prescriptions.table.expirationDate}</th>
              <th className="px-4 py-3 font-medium">{t.prescriptions.table.daysRemaining}</th>
              <th className="px-4 py-3 font-medium">{t.prescriptions.table.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-foreground">{row.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} expirationDate={new Date(row.expirationDateValue)} />
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground-muted">{renderPackBadge(row)}</td>
                <td className="px-4 py-3 tabular-nums text-foreground-muted">{row.startDate}</td>
                <td className="px-4 py-3 tabular-nums text-foreground-muted">{row.expirationDate}</td>
                <td className="px-4 py-3 text-foreground-muted">{row.daysRemaining}</td>
                <td className="px-4 py-3">{renderActions(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      <UsePacksDialog
        open={Boolean(packTargetId) && remaining > 0}
        remaining={remaining}
        prescriptionTitle={packTarget?.title ?? ""}
        onConfirm={async (packs) => {
          if (packTargetId) await onUsePacks(packTargetId, packs);
          setPackTargetId(null);
        }}
        onCancel={() => setPackTargetId(null)}
      />

      <ConfirmationDialog
        open={Boolean(deleteTargetId)}
        title={t.common.delete}
        description={t.prescriptions.removeMonth}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        variant="danger"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) await onDelete(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />
    </>
  );
}
