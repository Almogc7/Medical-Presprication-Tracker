import Link from "next/link";

import { Card } from "@/components/ui/card";

export function PersonCard({
  id,
  name,
  activeCount,
  issuedCount,
  nearestExpiration,
  warning,
  labels,
}: {
  id: string;
  name: string;
  activeCount: number;
  issuedCount: number;
  nearestExpiration: string;
  warning: boolean;
  labels: { active: string; issued: string; nearest: string };
}) {
  return (
    <Link href={`/people/${id}`}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          {warning ? (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">!</span>
          ) : null}
        </div>
        <div className="mt-4 space-y-1 text-sm text-slate-600">
          <p>
            {labels.active}: <span className="font-semibold text-slate-800">{activeCount}</span>
          </p>
          <p>
            {labels.issued}: <span className="font-semibold text-slate-800">{issuedCount}</span>
          </p>
          <p>
            {labels.nearest}: <span className="font-semibold text-slate-800">{nearestExpiration}</span>
          </p>
        </div>
      </Card>
    </Link>
  );
}
