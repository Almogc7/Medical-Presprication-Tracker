export function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red" | "gray";
}) {
  const valueClass =
    tone === "green"
      ? "text-status-healthy"
      : tone === "amber"
        ? "text-status-warning"
        : tone === "red"
          ? "text-status-danger"
          : "text-foreground-subtle";

  return (
    <dl className="flex flex-col-reverse gap-0.5 px-5 py-4 first:pl-4 last:pr-4">
      <dt className="text-xs text-foreground-subtle">{label}</dt>
      <dd className={`text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</dd>
    </dl>
  );
}
