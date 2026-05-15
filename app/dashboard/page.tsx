import { format } from "date-fns";

import { IssuableList } from "@/components/dashboard/issuable-list";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDictionary } from "@/lib/i18n";
import { getDashboardData } from "@/services/dashboard-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ t }, data] = await Promise.all([getDictionary(), getDashboardData()]);

  return (
    <ProtectedPage>
      <PageHeader title={t.dashboard.title} />

      {/* Compact stats strip */}
      <div className="mb-8 flex divide-x divide-border overflow-x-auto rounded-xl border border-border bg-surface">
        <SummaryCard label={t.dashboard.summary.active} value={data.summary.active} tone="green" />
        <SummaryCard label={t.dashboard.summary.expiringSoon} value={data.summary.expiringSoon} tone="amber" />
        <SummaryCard label={t.dashboard.summary.expired} value={data.summary.expired} tone="red" />
        <SummaryCard label={t.dashboard.summary.issued} value={data.summary.issued} tone="gray" />
      </div>

      {/* Primary alerts — urgent first, upcoming second */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className={
          data.urgent.length > 0
            ? "rounded-xl border border-status-danger/40 bg-status-danger-bg/30 p-4 shadow-sm"
            : "rounded-xl border border-border bg-surface p-4 shadow-sm"
        }>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">{t.dashboard.urgentAlerts}</h2>
          <div className="mt-4">
            {data.urgent.length ? (
              <IssuableList items={data.urgent} urgent />
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.urgentAlerts} />
            )}
          </div>
        </div>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">{t.dashboard.upcomingExpirations}</h2>
          <div className="mt-4">
            {data.upcomingExpirations.length ? (
              <IssuableList items={data.upcomingExpirations} />
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.upcomingExpirations} />
            )}
          </div>
        </Card>
      </div>

      {/* Secondary info — per person and recent activity */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">{t.dashboard.perPerson}</h2>
          <div className="mt-4 divide-y divide-border-subtle">
            {data.perPerson.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{person.fullName}</p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {t.people.activeCount}: {person.active} · {t.people.issuedCount}: {person.issued}
                  </p>
                </div>
                <p className="flex-shrink-0 text-xs tabular-nums text-foreground-subtle">
                  {person.nearestExpiration ? format(person.nearestExpiration, "yyyy-MM-dd") : "—"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">{t.dashboard.recentActivity}</h2>
          <div className="mt-4 divide-y divide-border-subtle">
            {data.recentActivity.length ? (
              data.recentActivity.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{item.prescriptionTitle}</p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {item.person} · {item.action}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-foreground-subtle">
                    {format(item.createdAt, "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.recentActivity} />
            )}
          </div>
        </Card>
      </div>
    </ProtectedPage>
  );
}
