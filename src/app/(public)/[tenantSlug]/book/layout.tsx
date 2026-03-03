import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { domain: tenantSlug },
  });

  if (!tenant) return {};

  return {
    title: `${tenant.name} - Online Randevu`,
    description: `${tenant.name} için online randevu alın.`,
  };
}

export default async function PublicBookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { domain: tenantSlug },
        { id: tenantSlug }, // Fallback to ID for testing
      ],
    },
  });

  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-semibold text-xl tracking-tight text-neutral-900">
            {tenant.name}
          </div>
          <div className="text-sm text-neutral-500">Online Randevu Sistemi</div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {children}
      </main>

      <footer className="bg-white border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
          Powered by Your SaaS Platform
        </div>
      </footer>
    </div>
  );
}
