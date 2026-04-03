import { Card } from "@/components/ui/card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="text-center">
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </Card>
  );
}
