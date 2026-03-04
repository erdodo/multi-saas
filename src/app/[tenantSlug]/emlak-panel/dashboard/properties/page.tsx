import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProperties } from "@/modules/emlak/actions/property.actions";
import { PropertiesClient } from "@/modules/emlak/components/properties/PropertiesClient";

interface Props {
  params:      Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ status?: string; type?: string; search?: string; page?: string }>;
}

export default async function PropertiesPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;
  const sp = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getProperties(tenant.id, {
    page:   Number(sp.page  ?? 1),
    limit:  20,
    status: sp.status,
    type:   sp.type,
    search: sp.search,
  });

  // Mülk sahibi listesi (form dropdown için)
  const owners = await prisma.propertyOwner.findMany({
    where: { tenantId: tenant.id, isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ firstName: "asc" }],
  });

  return (
    <PropertiesClient
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      initialData={result.success ? result.data! : { items: [], total: 0, page: 1, limit: 20 }}
      owners={owners}
    />
  );
}
