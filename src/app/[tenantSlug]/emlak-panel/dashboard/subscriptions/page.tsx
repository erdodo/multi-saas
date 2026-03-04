import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSubscriptions } from "@/modules/emlak/actions/subscription.actions";
import { SubscriptionsClient } from "@/modules/emlak/components/subscriptions/SubscriptionsClient";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function SubscriptionsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getSubscriptions(tenant.id);

  const properties = await prisma.property.findMany({
    where: { tenantId: tenant.id, isActive: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <SubscriptionsClient
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      initialData={result.success ? result.data! : []}
      properties={properties}
    />
  );
}
