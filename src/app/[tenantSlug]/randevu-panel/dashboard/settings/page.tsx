import { auth } from "@/auth";
import { getTenantSettings, getHolidays } from "@/modules/randevu/actions/tenant.actions";
import SettingsForm from "@/modules/randevu/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const [settingsResult, holidaysResult] = await Promise.all([
    getTenantSettings(tenantId),
    getHolidays(tenantId),
  ]);

  const settings = settingsResult.success ? settingsResult.data! : null;
  const holidays = holidaysResult.success ? holidaysResult.data! : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-(--brand-text)">İŞletme Ayarları</h1>
        <p className="text-(--brand-text-muted) text-sm">İşletme ve randevu sistemi yapılandırması</p>
      </div>
      <SettingsForm settings={settings} holidays={holidays} tenantId={tenantId} />
    </div>
  );
}
