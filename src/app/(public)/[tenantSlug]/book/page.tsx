import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookingFlow from "@/modules/appointment/components/BookingFlow";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  const rawTenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ domain: tenantSlug }, { id: tenantSlug }],
    },
    include: {
      services: true,
      staffs: {
        include: {
          staffServices: true,
        },
      },
    },
  });

  const tenant = rawTenant as any;

  if (!tenant) notFound();

  // If no services or no active staff available yet
  if (tenant.services?.length === 0 || tenant.staffs?.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center text-neutral-500">
        Henüz online randevu alımı için uygun hizmet veya personel
        tanımlanmamış.
      </div>
    );
  }

  return (
    <BookingFlow
      tenantId={tenant.id}
      services={tenant.services || []}
      staffs={tenant.staffs || []}
    />
  );
}
