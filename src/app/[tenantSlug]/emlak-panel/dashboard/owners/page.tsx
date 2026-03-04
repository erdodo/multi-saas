import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOwners } from "@/modules/emlak/actions/owner.actions";
import { OwnersClient } from "@/modules/emlak/components/owners/OwnersClient";

interface Props {
  params:       Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function OwnersPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;
  const { search } = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getOwners(tenant.id, search);

  return (
    <OwnersClient
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      initialData={result.success ? result.data! : []}
    />
  );
}
