import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ödemeler — MultiSaaS Docs" };

export default function OdemelerPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Ödemeler
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Kira sözleşmesine bağlı aylık ödeme takvimini görüntüleyin, tahsilat
          kaydedin ve gecikmiş ödemeleri takip edin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard/payments
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Ödeme Durumları</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700" },
            { label: "Ödendi", color: "bg-green-100 text-green-700" },
            { label: "Kısmi Ödeme", color: "bg-blue-100 text-blue-700" },
            { label: "Gecikmiş", color: "bg-red-100 text-red-700" },
          ].map((s) => (
            <span
              key={s.label}
              className={`text-xs px-3 py-1 rounded-full font-semibold ${s.color}`}
            >
              {s.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Vadesi geçen <em>Bekliyor</em> ödemeleri, sistem tarafından otomatik
          olarak
          <strong> Gecikmiş</strong>'e çevrilir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Filtreler</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-36">
                  Filtre
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { f: "Durum", d: "Bekliyor / Ödendi / Kısmi / Gecikmiş" },
                { f: "Ay / Yıl", d: "Belirli bir aya ait ödemeleri göster" },
                { f: "Sözleşme", d: "Belirli bir sözleşmenin tüm ödemeleri" },
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
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Tahsilat Kaydetme</h2>
        <p className="text-sm text-slate-600">
          Ödeme satırındaki <strong>Tahsil Et</strong> butonuna tıklayın. Form
          alanları:
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-40">
                  Alan
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-20">
                  Zorunlu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {
                  f: "Ödenen Tutar",
                  d: "Tam tutar = Ödendi; daha az = Kısmi Ödeme",
                  z: "✓",
                },
                {
                  f: "Ödeme Tarihi",
                  d: "Tahsilatın gerçekleştiği tarih",
                  z: "✓",
                },
                {
                  f: "Ödeme Yöntemi",
                  d: "Nakit, Havale, Kredi Kartı vb.",
                  z: "",
                },
                { f: "Makbuz No", d: "Fiş veya makbuz numarası", z: "" },
                { f: "Notlar", d: "Serbest metin", z: "" },
              ].map((r) => (
                <tr key={r.f}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.f}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.d}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">
                    {r.z}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Kısmi ödeme:</strong> Girilen tutar beklenen tutardan düşükse
          ödeme durumu otomatik olarak <em>Kısmi Ödeme</em> olarak kaydedilir.
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/emlak/sozlesmeler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Sözleşmeler
        </Link>
        <Link
          href="/docs/emlak/mal-sahipleri"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Mal Sahipleri →
        </Link>
      </div>
    </article>
  );
}
