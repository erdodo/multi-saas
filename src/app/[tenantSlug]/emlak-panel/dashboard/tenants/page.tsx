import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPropertyTenants } from "@/modules/emlak/actions/propertyTenant.actions";
import { TenantsClient } from "@/modules/emlak/components/tenants/TenantsClient";

interface Props {
  params:       Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function TenantsPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;
  const { search } = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getPropertyTenants(tenant.id, search);

  return (
    <TenantsClient
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      initialData={result.success ? result.data! : []}
    />
  );
}
