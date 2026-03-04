import AppointmentLookup from "@/modules/randevu/components/appointments/AppointmentLookup";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTenantBranding, brandCssVars } from "@/lib/branding";

interface Params {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { tenantSlug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { name: true },
  });
  return { title: `Randevu Sorgula — ${tenant?.name ?? tenantSlug}` };
}

export default async function AppointmentLookupPage({ params }: Params) {
  const { tenantSlug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { name: true },
  });
  if (!tenant) notFound();

  const b = await getTenantBranding(tenantSlug);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        ...brandCssVars(b),
        background: `linear-gradient(135deg, #f8fafc 0%, ${b.primaryColor}15 100%)`,
      }}
    >
      <div className="w-full max-w-lg">
        <div
          className="bg-white shadow-lg p-6 space-y-6"
          style={{ borderRadius: b.radiusPx }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🔍</div>
            <h1 className="text-xl font-bold text-gray-900">Randevu Sorgula</h1>
            <p className="text-sm text-gray-500 mt-1">
              Telefon numaranızı girerek daha önce aldığınız randevulara ulaşın
            </p>
          </div>
          <AppointmentLookup tenantSlug={tenantSlug} />
        </div>
      </div>
    </div>
  );
}
