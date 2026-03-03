import { auth } from "@/auth";
import { getServices } from "@/modules/randevu/actions/service.actions";
import ServiceList from "@/modules/randevu/components/services/ServiceList";

export default async function ServicesPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const result = await getServices(tenantId);
  const services = result.success ? result.data! : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hizmetler</h1>
          <p className="text-gray-500 text-sm">{services.length} hizmet</p>
        </div>
      </div>
      <ServiceList services={services} tenantId={tenantId} />
    </div>
  );
}
