import { auth } from "@/auth";
import { getStaffById } from "@/modules/randevu/actions/staff.actions";
import { getServices } from "@/modules/randevu/actions/service.actions";
import StaffDetailForm from "@/modules/randevu/components/staff/StaffDetailForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const { id, tenantSlug } = await params;

  const [staffRes, servicesRes] = await Promise.all([
    getStaffById(id, tenantId),
    getServices(tenantId),
  ]);

  if (!staffRes.success || !staffRes.data) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/${tenantSlug}/randevu-panel/dashboard/staff`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Personel
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{staffRes.data.name}</h1>
      </div>
      <StaffDetailForm
        staff={staffRes.data}
        services={servicesRes.success ? servicesRes.data! : []}
        tenantId={tenantId}
      />
    </div>
  );
}
