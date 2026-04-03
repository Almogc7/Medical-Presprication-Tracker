import { Card } from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red" | "gray";
}) {
  const styles =
    tone === "green"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : tone === "red"
          ? "text-rose-600"
          : "text-slate-600";

  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${styles}`}>{value}</p>
    </Card>
  );
}
