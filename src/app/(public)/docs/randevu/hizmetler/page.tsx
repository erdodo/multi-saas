import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hizmetler — MultiSaaS Docs" };

export default function HizmetlerPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Hizmetler
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Müşterilerin randevu alabileceği hizmetleri tanımlayın. Her hizmetin
          süresi, fiyatı ve atanabileceği personel buradan belirlenir.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/services
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Hizmet Listesi</h2>
        <p className="text-sm text-slate-600">
          Mevcut hizmetler kart veya tablo görünümünde listelenir. Her hizmet
          kartında ad, süre, fiyat ve aktiflik durumu görünür.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Yeni Hizmet Ekleme</h2>
        <p className="text-sm text-slate-600">
          <strong>Yeni Hizmet Ekle</strong> butonuna tıklayarak form açılır.
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {
                  f: "Hizmet Adı",
                  d: "Rezervasyon formunda görünecek isim (örn: Saç Kesimi)",
                },
                { f: "Açıklama", d: "Kısa hizmet tanımı" },
                { f: "Süre (dakika)", d: "Randevu bloğunun uzunluğu" },
                { f: "Fiyat", d: "Ücret miktarı" },
                { f: "Para Birimi", d: "Varsayılan: TRY" },
                { f: "Renk", d: "Takvim ve listede gösterilecek renk kodu" },
                {
                  f: "Aktif",
                  d: "Pasif yapıldığında online rezervasyon formunda görünmez",
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
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Hizmet Düzenleme / Silme
        </h2>
        <p className="text-sm text-slate-600">
          Her hizmetin yanındaki düzenle (kalem) ikonu formu düzenleme modunda
          açar. Silme ikonu, onay sonrası hizmeti kalıcı olarak kaldırır.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Dikkat:</strong> Aktif randevular olan bir hizmeti pasif
          yapmak yeni rezervasyonu durdurur ancak mevcut randevuları etkilemez.
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/musteriler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Müşteriler
        </Link>
        <Link
          href="/docs/randevu/personel"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Personel →
        </Link>
      </div>
    </article>
  );
}
