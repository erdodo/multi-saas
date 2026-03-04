import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

/**
 * /[tenantSlug]/app/emlak → /[tenantSlug]/emlak-panel/dashboard
 * NavLinks'teki bağlantıyı çalışır hale getirir.
 */
export default async function EmlakRedirectPage({ params }: Props) {
  const { tenantSlug } = await params;
  redirect(`/${tenantSlug}/emlak-panel/dashboard`);
}
