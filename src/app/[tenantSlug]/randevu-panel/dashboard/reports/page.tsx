import { auth } from "@/auth";
import { getReports } from "@/modules/randevu/actions/tenant.actions";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-400", CONFIRMED: "bg-blue-400", CANCELLED: "bg-red-400",
  COMPLETED: "bg-green-400", NO_SHOW: "bg-gray-400", RESCHEDULED: "bg-purple-400",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", CONFIRMED: "Onaylandı", CANCELLED: "İptal",
  COMPLETED: "Tamamlandı", NO_SHOW: "Gelmedi", RESCHEDULED: "Ertelendi",
};

export default async function ReportsPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const result = await getReports(tenantId, from, to);
  const data = result.success ? result.data! : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <p className="text-gray-500 text-sm">Bu ay genel özet</p>
      </div>

      {!data ? (
        <p className="text-gray-500">Veriler yüklenemedi.</p>
      ) : (
        <>
          {/* Özet kartları */}
          {(() => {
            const totalAppointments = data.statusBreakdown.reduce((s, r) => s + r.count, 0);
            const noShowRate = totalAppointments > 0
              ? `%${Math.round((data.noShowCount / totalAppointments) * 100)}`
              : "%0";
            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
                  <p className="text-sm text-gray-600 mt-1">Toplam Randevu</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-2xl font-bold text-green-700">
                    {data.totalRevenue.toLocaleString("tr-TR")} ₺
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Tamamlanan Gelir</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-2xl font-bold text-red-600">{data.noShowCount}</p>
                  <p className="text-sm text-gray-600 mt-1">No-show Sayısı</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-2xl font-bold text-orange-600">{noShowRate}</p>
                  <p className="text-sm text-gray-600 mt-1">No-show Oranı</p>
                </div>
              </div>
            );
          })()}

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Durum Dağılımı</h2>
            <div className="space-y-3">
              {(() => {
                const total = data.statusBreakdown.reduce((s, r) => s + r.count, 0);
                return data.statusBreakdown.map((s) => {
                  const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{STATUS_LABELS[s.status] ?? s.status}</span>
                        <span className="text-gray-500">{s.count} (%{pct})</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${STATUS_COLORS[s.status] ?? "bg-gray-400"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Hizmet Dağılımı</h2>
              {data.byService.length === 0 ? <p className="text-sm text-gray-400">Veri yok</p> : (
                <div className="space-y-2">
                  {data.byService.sort((a, b) => b.count - a.count).map((s) => (
                    <div key={s.serviceId} className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate">{s.serviceName}</span>
                      <span className="font-medium text-gray-900 ml-2">{s.count} randevu</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Personel Performansı</h2>
              {data.byStaff.length === 0 ? <p className="text-sm text-gray-400">Veri yok</p> : (
                <div className="space-y-2">
                  {data.byStaff.sort((a, b) => b.count - a.count).map((s) => (
                    <div key={s.staffId} className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate">{s.staffName}</span>
                      <span className="font-medium text-gray-900 ml-2">{s.count} randevu</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
