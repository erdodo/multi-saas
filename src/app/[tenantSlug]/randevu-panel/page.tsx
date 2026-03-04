import { redirect } from "next/navigation";

export default async function RandevuPanelRoot({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  redirect(`/${tenantSlug}/randevu-panel/dashboard`);
}
