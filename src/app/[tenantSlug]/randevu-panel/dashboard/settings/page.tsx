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
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-500 text-sm">İşletme ve randevu sistemi yapılandırması</p>
      </div>
      <SettingsForm settings={settings} holidays={holidays} tenantId={tenantId} />
    </div>
  );
}
