import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDocuments } from "@/modules/emlak/actions/document.actions";
import { DocumentsClient } from "@/modules/emlak/components/documents/DocumentsClient";

interface Props {
  params:       Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ propertyId?: string; leaseId?: string }>;
}

export default async function DocumentsPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;
  const sp = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getDocuments(tenant.id, sp.propertyId, sp.leaseId);

  const [properties, leases] = await Promise.all([
    prisma.property.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.lease.findMany({
      where: { tenantId: tenant.id },
      select: {
        id: true,
        property:       { select: { title: true } },
        propertyTenant: { select: { firstName: true, lastName: true } },
        startDate: true,
        endDate:   true,
      },
      orderBy: { startDate: "desc" },
    }),
  ]);

  return (
    <DocumentsClient
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      initialData={result.success ? result.data! : []}
      properties={properties}
      leases={leases}
    />
  );
}
