import { auth } from "@/auth";
import { getServices } from "@/modules/randevu/actions/service.actions";
import NewStaffForm from "@/modules/randevu/components/staff/NewStaffForm";
import Link from "next/link";

export default async function NewStaffPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const { tenantSlug } = await params;

  const servicesResult = await getServices(tenantId);
  const services = servicesResult.success ? servicesResult.data! : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/${tenantSlug}/randevu-panel/dashboard/staff`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Personel
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Personel</h1>
      </div>
      <NewStaffForm services={services} tenantId={tenantId} tenantSlug={tenantSlug} />
    </div>
  );
}
