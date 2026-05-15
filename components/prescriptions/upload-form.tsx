"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useLocale } from "@/components/ui/locale-provider";

type PersonOption = { id: string; fullName: string };

type ParseResult = {
  uploadToken: string;
  originalFileName: string;
  extractedText: string;
  suggestedTitle: string;
  startDate: string;
  expirationDate: string;
  confidence: number;
  suggestedPacks: number | null;
  monthEntries?: { startDate: string; expirationDate: string }[];
};

type MonthEntry = {
  startDate: string;
  expirationDate: string;
};

type MessageState = { text: string; type: "error" | "info" } | null;

export function UploadForm({ people }: { people: PersonOption[] }) {
  const { t } = useLocale();
  const [personId,     setPersonId]     = useState(people[0]?.id ?? "");
  const [title,        setTitle]        = useState("");
  const [notes,        setNotes]        = useState("");
  const [totalPacks,   setTotalPacks]   = useState(1);
  const [file,         setFile]         = useState<File | null>(null);
  const [parsed,       setParsed]       = useState<ParseResult | null>(null);
  const [monthEntries, setMonthEntries] = useState<MonthEntry[]>([]);
  const [message,      setMessage]      = useState<MessageState>(null);
  const [parsing,      setParsing]      = useState(false);
  const [saving,       setSaving]       = useState(false);

  const canParse = Boolean(file) && !parsing;

  async function parsePdf() {
    if (!file) return;
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setParsing(true);
      const response = await fetch("/api/prescriptions/parse", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as ParseResult | { error?: string };

      if (!response.ok) {
        setMessage({
          text: "error" in payload ? payload.error || t.prescriptions.parseError : t.prescriptions.parseError,
          type: "error",
        });
        return;
      }

      const result = payload as ParseResult;
      setParsed(result);
      setTitle(result.suggestedTitle || title);
      if (result.suggestedPacks) setTotalPacks(result.suggestedPacks);

      const entries = Array.isArray(result.monthEntries)
        ? result.monthEntries.filter((e: MonthEntry) => e.startDate && e.expirationDate)
        : [];
      const fallback =
        result.startDate && result.expirationDate
          ? [{ startDate: result.startDate, expirationDate: result.expirationDate }]
          : [];

      setMonthEntries(entries.length ? entries : fallback);
      setMessage({
        text: entries.length > 1 ? t.prescriptions.monthlyDetected : t.prescriptions.reviewMessage,
        type: "info",
      });
    } catch {
      setMessage({ text: t.prescriptions.parseError, type: "error" });
    } finally {
      setParsing(false);
    }
  }

  async function savePrescription() {
    if (!parsed) return;

    if (!personId) {
      setMessage({ text: t.prescriptions.selectPersonBeforeSave, type: "error" });
      return;
    }
    if (!title) return;
    if (!monthEntries.length) {
      setMessage({ text: t.prescriptions.nothingToSave, type: "error" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/prescriptions/create-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        baseTitle: title,
        notes,
        totalPacks,
        monthEntries,
        uploadToken: parsed.uploadToken,
        originalFileName: parsed.originalFileName,
        extractedText: parsed.extractedText,
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage({ text: payload.error || "Could not save prescription", type: "error" });
      return;
    }

    setMessage({ text: "Saved successfully", type: "info" });
    setParsed(null);
    setFile(null);
    setMonthEntries([]);
    setTitle("");
    setNotes("");
    setTotalPacks(1);
  }

  function updateMonthEntry(index: number, patch: Partial<MonthEntry>) {
    setMonthEntries((curr) =>
      curr.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  function removeMonthEntry(index: number) {
    setMonthEntries((curr) => curr.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5 rounded-[var(--radius-panel)] border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm text-slate-600">{t.prescriptions.uploadHelper}</p>

      {/* ── Step 1: choose person + file ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t.sidebar.people}
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          disabled={!people.length}
        >
          {!people.length ? (
            <option value="">{t.prescriptions.noPeopleAvailable}</option>
          ) : null}
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </Select>

        <Input
          label="PDF"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <Button
        variant="primary"
        disabled={!canParse}
        loading={parsing}
        onClick={parsePdf}
        className="w-full sm:w-auto"
      >
        Parse PDF
      </Button>

      {/* ── Step 2: review + save ────────────────────────────────────────── */}
      {parsed ? (
        <div className="space-y-4 rounded-[var(--radius-panel)] border border-accent-subtle bg-accent-subtle/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Review detected dates
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={t.prescriptions.table.title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label={t.prescriptions.totalPacks}
              type="number"
              min={1}
              value={totalPacks}
              onChange={(e) => setTotalPacks(Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </div>

          {monthEntries.map((entry, index) => (
            <div
              key={`${entry.startDate}-${entry.expirationDate}-${index}`}
              className="space-y-3 rounded-[var(--radius-component)] border border-border bg-surface p-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label={t.common.startsOn}
                  type="date"
                  value={entry.startDate}
                  onChange={(e) => updateMonthEntry(index, { startDate: e.target.value })}
                />
                <Input
                  label={t.common.expiresOn}
                  type="date"
                  value={entry.expirationDate}
                  onChange={(e) => updateMonthEntry(index, { expirationDate: e.target.value })}
                />
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeMonthEntry(index)}
                className="w-full sm:w-auto"
              >
                {t.prescriptions.removeMonth}
              </Button>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.common.notes}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-[var(--radius-component)] border border-border bg-surface px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </label>
          </div>

          <Button
            variant="primary"
            loading={saving}
            disabled={saving || !personId}
            onClick={savePrescription}
            className="w-full sm:w-auto"
          >
            {t.prescriptions.saveAllMonths}
          </Button>
        </div>
      ) : null}

      {/* ── Status message — announced to screen readers ──────────────────── */}
      {message ? (
        <p
          role={message.type === "error" ? "alert" : undefined}
          aria-live={message.type === "error" ? undefined : "polite"}
          className={
            message.type === "error"
              ? "text-sm text-status-danger"
              : "text-sm text-slate-600"
          }
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
