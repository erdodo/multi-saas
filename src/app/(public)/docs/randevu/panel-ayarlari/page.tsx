import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel Ayarları — MultiSaaS Docs" };

export default function PanelAyarlariPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Panel Ayarları
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Online rezervasyon davranışını ve sistem tercihlerini yapılandırın.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/settings
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Rezervasyon Ayarları
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-56">
                  Ayar
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {
                  f: "Rezervasyon Penceresi (gün)",
                  d: "Müşteriler kaç gün ileriye randevu alabilsin? Varsayılan: 60 gün",
                },
                {
                  f: "Slot Aralığı (dakika)",
                  d: "Randevu zaman dilimlerinin aralığı. Varsayılan: 15 dakika",
                },
                {
                  f: "Otomatik Onayla",
                  d: "Açık: yeni randevular otomatik onaylanır. Kapalı: manuel onay gerekir",
                },
              ].map((r) => (
                <tr key={r.f}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.f}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Buton:</strong> <em>Kaydet</em> — Değişiklikler kaydedildikten
          sonra yeni rezervasyonları hemen etkiler.
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/raporlar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Raporlar
        </Link>
        <Link
          href="/docs/randevu/online-rezervasyon"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Online Rezervasyon →
        </Link>
      </div>
    </article>
  );
}
