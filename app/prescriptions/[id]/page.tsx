import Link from "next/link";
import { notFound } from "next/navigation";

import { EditTotalPacks } from "@/components/prescriptions/edit-total-packs";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getReadableDaysRemaining } from "@/services/prescription-service";
import { formatDateInIsrael } from "@/utils/date";
import { resolvePdfHref } from "@/utils/pdf-path";

export const dynamic = "force-dynamic";

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ t }, prescription] = await Promise.all([
    getDictionary(),
    (async () => {
      const { id } = await params;
      return prisma.prescription.findUnique({
        where: { id },
        include: { person: true },
      });
    })(),
  ]);

  if (!prescription) {
    notFound();
  }

  return (
    <ProtectedPage>
      <PageHeader
        title={prescription.title}
        subtitle={t.prescriptions.detail}
        actions={
          <Link
            href="/people"
            className="inline-flex h-11 items-center px-1 text-sm text-foreground-muted underline underline-offset-2 hover:text-foreground"
          >
            {t.common.back}
          </Link>
        }
      />
      <Card className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground-muted">{prescription.person.fullName}</p>
          <StatusBadge status={prescription.status} expirationDate={prescription.expirationDate} />
        </div>
        <p className="text-sm text-foreground-muted">{t.common.startsOn}: <span className="text-foreground">{formatDateInIsrael(prescription.startDate)}</span></p>
        <p className="text-sm text-foreground-muted">{t.common.expiresOn}: <span className="text-foreground">{formatDateInIsrael(prescription.expirationDate)}</span></p>
        <p className="text-sm text-foreground-muted">{t.common.daysRemaining}: <span className="text-foreground">{getReadableDaysRemaining(prescription.expirationDate)}</span></p>
        <EditTotalPacks
          prescriptionId={prescription.id}
          totalPacks={prescription.totalPacks}
          usedPacks={prescription.usedPacks}
        />
        <p className="text-sm text-foreground-muted">{t.common.notes}: <span className="text-foreground">{prescription.notes || "-"}</span></p>
        <div className="pt-2">
          <Link
            href={resolvePdfHref(prescription.pdfPath)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-component)] border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-border-subtle active:bg-border sm:w-auto"
          >
            {t.common.viewPdf}
          </Link>
        </div>
      </Card>
    </ProtectedPage>
  );
}
