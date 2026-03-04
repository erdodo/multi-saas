import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPayments } from "@/modules/emlak/actions/payment.actions";
import { PaymentsClient } from "@/modules/emlak/components/payments/PaymentsClient";

interface Props {
  params:       Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ status?: string; leaseId?: string; month?: string; year?: string }>;
}

export default async function PaymentsPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;
  const sp = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getPayments(tenant.id, {
    status:  sp.status,
    leaseId: sp.leaseId,
    month:   sp.month  ? Number(sp.month)  : undefined,
    year:    sp.year   ? Number(sp.year)   : undefined,
  });

  return (
    <PaymentsClient
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      initialData={result.success ? result.data! : []}
    />
  );
}
