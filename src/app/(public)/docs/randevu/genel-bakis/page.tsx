import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Randevu Modülü — Genel Bakış — MultiSaaS Docs",
};

export default function RandevuGenelBakisPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Genel Bakış
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Randevu Paneli, işletmenizin tüm randevu süreçlerini yönettiğiniz ana
          merkez. Sol kenar çubuğundan tüm bölümlere erişirsiniz.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard
        </p>
      </div>

      {/* Dashboard istatistikler */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Dashboard — İstatistik Kartları
        </h2>
        <p className="text-sm text-slate-600">
          Sayfanın üstünde 4 istatistik kartı görüntülenir:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: "📅",
              label: "Bugünkü Randevu",
              detail: "Toplam ve onaylı adet",
            },
            {
              icon: "⏳",
              label: "Bekleyen",
              detail: "Yanıt bekleyen randvular",
            },
            {
              icon: "📊",
              label: "Bu Hafta",
              detail: "Haftanın onaylı randevuları",
            },
            {
              icon: "💰",
              label: "Aylık Gelir",
              detail: "Tamamlanan randevuların geliri",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <span className="text-2xl">{c.icon}</span>
              <p className="font-semibold text-slate-900 text-sm mt-2">
                {c.label}
              </p>
              <p className="text-xs text-slate-400">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Yaklaşan Randevular Listesi
        </h2>
        <p className="text-sm text-slate-600">
          Dashboard'un alt bölümünde bugünden itibaren en yakın 8 randevu
          gösterilir. Her satırda; müşteri adı, hizmet, uzman, tarih/saat ve
          durum yer alır.
        </p>
        <p className="text-sm text-slate-600">
          <strong>Tümünü Gör</strong> bağlantısı sizi tam randevu listesine
          yönlendirir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Kenar Çubuğu Navigasyonu
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Bölüm
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  URL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { label: "Genel Bakış", path: "dashboard" },
                { label: "Randevular", path: "dashboard/appointments" },
                { label: "Takvim", path: "dashboard/calendar" },
                { label: "Müşteriler", path: "dashboard/customers" },
                { label: "Hizmetler", path: "dashboard/services" },
                { label: "Personel", path: "dashboard/staff" },
                { label: "Raporlar", path: "dashboard/reports" },
                { label: "Ayarlar", path: "dashboard/settings" },
              ].map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.label}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">
                    /{"{tenantSlug}"}/randevu-panel/{r.path}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/ayarlar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Ayarlar
        </Link>
        <Link
          href="/docs/randevu/randevular"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Randevular →
        </Link>
      </div>
    </article>
  );
}
