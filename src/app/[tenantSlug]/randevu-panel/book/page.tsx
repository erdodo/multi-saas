import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BookingFlow from "@/modules/randevu/components/booking/BookingFlow";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  return {
    title: tenant ? `${tenant.siteTitle ?? tenant.name} — Randevu Al` : "Randevu Al",
    description: tenant ? `${tenant.name} işletmesinden online randevu alın.` : undefined,
  };
}

export default async function BookingPage({ params }: Props) {
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || !tenant.setupCompleted) notFound();

  const primaryColor = tenant.primaryColor ?? "#3b82f6";
  const textOnPrimary = tenant.textOnPrimary ?? "#ffffff";

  const [services, staffList, settings] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.staff.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: {
        staffServices: { select: { serviceId: true } },
        availabilityRules: { where: { isActive: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.tenantSettings.findUnique({ where: { tenantId: tenant.id } }),
  ]);

  if (services.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: primaryColor }}
      >
        <div className="bg-white rounded-2xl p-10 text-center shadow-xl max-w-sm mx-4">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{tenant.name}</h2>
          <p className="text-gray-500">Henüz aktif hizmet bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with tenant branding */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              width={40}
              height={40}
              className="rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: primaryColor, color: textOnPrimary }}
            >
              {tenant.name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">
              {tenant.name}
            </h1>
            {tenant.address && (
              <p className="text-xs text-gray-500 leading-none mt-0.5">
                📍 {tenant.address}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Booking flow */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <BookingFlow
          tenantId={tenant.id}
          tenantSlug={tenant.slug ?? tenantSlug}
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description ?? null,
            duration: Number(s.duration),
            price: Number(s.price),
            currency: s.currency ?? "TRY",
            color: s.color ?? "#3b82f6",
          }))}
          staffList={staffList.map((s) => ({
            id: s.id,
            name: s.name,
            bio: s.bio ?? null,
            color: s.color ?? null,
            serviceIds: s.staffServices.map((ss) => ss.serviceId),
            availableDays: s.availabilityRules.map((r) => r.dayOfWeek),
          }))}
          settings={{
            bookingWindowDays: settings?.bookingWindowDays ?? 60,
            slotIntervalMinutes: settings?.slotIntervalMinutes ?? 15,
            autoConfirm: settings?.autoConfirm ?? false,
          }}
        />
      </div>
    </div>
  );
}
