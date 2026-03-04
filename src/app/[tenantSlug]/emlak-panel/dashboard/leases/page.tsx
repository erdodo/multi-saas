import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLeases } from "@/modules/emlak/actions/lease.actions";
import { LeasesClient } from "@/modules/emlak/components/leases/LeasesClient";

interface Props {
  params:       Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function LeasesPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;
  const { status } = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getLeases(tenant.id, status);

  // Properties and tenants for the create form
  const [properties, tenants, owners] = await Promise.all([
    prisma.property.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: { id: true, title: true, address: true, status: true },
      orderBy: { title: "asc" },
    }),
    prisma.propertyTenant.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: { id: true, firstName: true, lastName: true, phone: true },
      orderBy: [{ firstName: "asc" }],
    }),
    prisma.propertyOwner.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ firstName: "asc" }],
    }),
  ]);

  return (
    <LeasesClient
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      initialData={result.success ? result.data! : []}
      properties={properties}
      tenantsList={tenants}
      owners={owners}
    />
  );
}
