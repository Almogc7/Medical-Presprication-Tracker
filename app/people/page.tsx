import { format } from "date-fns";

import { addPersonAction, removePersonAction } from "@/app/people/actions";
import { SetPacksForPerson } from "@/components/people/set-packs-for-person";
import { ProtectedPage } from "@/components/layout/protected-page";
import { PersonCard } from "@/components/people/person-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MAX_TRACKED_PEOPLE } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { assertTrackedFamilyIntegrity } from "@/services/family-service";
import { daysUntilExpiration } from "@/utils/date";

export const dynamic = "force-dynamic";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  await assertTrackedFamilyIntegrity();
  const params = await searchParams;

  const [{ t }, people] = await Promise.all([
    getDictionary(),
    prisma.person.findMany({ include: { prescriptions: true }, orderBy: { fullName: "asc" } }),
  ]);

  const canAdd = people.length < MAX_TRACKED_PEOPLE;

  return (
    <ProtectedPage>
      <PageHeader title={t.people.title} />

      {params.success === "added" ? (
        <div role="status" className="mb-4 rounded-[var(--radius-component)] border border-status-healthy/40 bg-status-healthy-bg px-4 py-3 text-sm text-status-healthy">
          {t.people.addSuccess}
        </div>
      ) : null}

      {params.success === "removed" ? (
        <div role="status" className="mb-4 rounded-[var(--radius-component)] border border-status-healthy/40 bg-status-healthy-bg px-4 py-3 text-sm text-status-healthy">
          {t.people.removeSuccess}
        </div>
      ) : null}

      {params.error ? (
        <div role="alert" className="mb-4 rounded-[var(--radius-component)] border border-status-danger/40 bg-status-danger-bg px-4 py-3 text-sm text-status-danger">
          {decodeURIComponent(params.error)}
        </div>
      ) : null}

      <Card className="mb-5">
        <h2 className="text-base font-semibold text-foreground">{t.people.manageTitle}</h2>
        <p className="mt-1 text-sm text-foreground-muted">{t.people.maxReached}</p>

        <form action={addPersonAction} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            name="fullName"
            placeholder={t.people.fullName}
            aria-label={t.people.fullName}
            className="rounded-[var(--radius-component)] border border-border bg-canvas px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50"
            required
            disabled={!canAdd}
          />
          <input
            name="note"
            placeholder={t.people.optionalNote}
            aria-label={t.people.optionalNote}
            className="rounded-[var(--radius-component)] border border-border bg-canvas px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50"
            disabled={!canAdd}
          />
          <Button type="submit" variant="primary" disabled={!canAdd}>
            {t.people.addPerson}
          </Button>
        </form>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {people.map((person) => (
            <form
              key={person.id}
              action={removePersonAction}
              className="flex flex-col gap-2 rounded-[var(--radius-component)] border border-border bg-canvas px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-2"
            >
              <span className="text-sm text-foreground">{person.fullName}</span>
              <input type="hidden" name="personId" value={person.id} />
              <Button type="submit" variant="danger" size="sm" className="w-full sm:w-auto">
                {t.people.removePerson}
              </Button>
            </form>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => {
          const activeCount = person.prescriptions.filter((prescription) => prescription.status === "active").length;
          const issuedCount = person.prescriptions.filter((prescription) => prescription.status === "issued").length;
          const nearest = person.prescriptions
            .filter((prescription) => prescription.status === "active")
            .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())[0];

          return (
            <div key={person.id} className="flex flex-col gap-2">
              <PersonCard
                id={person.id}
                name={person.fullName}
                activeCount={activeCount}
                issuedCount={issuedCount}
                nearestExpiration={nearest ? format(nearest.expirationDate, "yyyy-MM-dd") : "-"}
                warning={nearest ? daysUntilExpiration(nearest.expirationDate) <= 7 : false}
                labels={{
                  active: t.people.activeCount,
                  issued: t.people.issuedCount,
                  nearest: t.people.nearestExpiration,
                }}
              />
              <SetPacksForPerson
                personId={person.id}
                prescriptionCount={person.prescriptions.length}
              />
            </div>
          );
        })}
      </div>
    </ProtectedPage>
  );
}
