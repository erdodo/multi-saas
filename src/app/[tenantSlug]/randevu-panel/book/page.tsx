import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BookingFlow from "@/modules/randevu/components/booking/BookingFlow";
import { CalendarDays, MapPin, Phone } from "lucide-react";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });
  return {
    title: tenant
      ? `${tenant.siteTitle ?? tenant.name} — Randevu Al`
      : "Randevu Al",
    description: tenant
      ? `${tenant.name} işletmesinden online randevu alın.`
      : undefined,
  };
}

export default async function BookingPage({ params }: Props) {
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });
  if (!tenant || !tenant.setupCompleted) notFound();

  const primaryColor = tenant.primaryColor ?? "#10b981";
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
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
        }}
      >
        <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {tenant.name}
          </h2>
          <p className="text-gray-400">Henüz aktif hizmet bulunmuyor.</p>
        </div>
      </div>
    );
  }

  // Use custom branding gradient for the header
  const headerGradient =
    primaryColor === "#10b981" || primaryColor === "#3b82f6"
      ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`
      : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <header
        className="py-8 px-4 shadow-lg"
        style={{ background: headerGradient }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                width={52}
                height={52}
                className="rounded-[var(--brand-radius,16px)] object-cover flex-shrink-0 shadow-lg border-2 border-white/30"
              />
            ) : (
              <div
                className="w-13 h-13 rounded-[var(--brand-radius,16px)] flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-lg border-2 border-white/30"
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  color: textOnPrimary,
                  width: 52,
                  height: 52,
                }}
              >
                {tenant.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1
                className="text-2xl font-bold leading-tight"
                style={{ color: textOnPrimary }}
              >
                {tenant.siteTitle ?? tenant.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {tenant.phone && (
                  <span
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: `${textOnPrimary}cc` }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {tenant.phone}
                  </span>
                )}
                {tenant.address && (
                  <span
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: `${textOnPrimary}cc` }}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {tenant.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Call-to-action banner */}
          <div
            className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: textOnPrimary,
              backdropFilter: "blur(8px)",
            }}
          >
            <CalendarDays className="w-4 h-4" />
            Randevu almak için takvimden bir gün seçin
          </div>
        </div>
      </header>

      {/* Booking Flow */}
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
            color: s.color ?? primaryColor,
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
