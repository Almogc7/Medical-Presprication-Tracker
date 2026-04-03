import { ProtectedPage } from "@/components/layout/protected-page";
import { UploadForm } from "@/components/prescriptions/upload-form";
import { PageHeader } from "@/components/ui/page-header";
import { getDictionary } from "@/lib/i18n";
import { getTrackedPeople } from "@/services/family-service";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const [{ t }, people] = await Promise.all([
    getDictionary(),
    getTrackedPeople(),
  ]);

  return (
    <ProtectedPage>
      <PageHeader title={t.common.uploadPrescription} />
      <UploadForm people={people} />
    </ProtectedPage>
  );
}
