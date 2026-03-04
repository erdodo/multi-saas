import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Abonelikler — MultiSaaS Docs" };

export default function AboneliklerPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Abonelikler
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Mülklere ait elektrik, su, doğalgaz, internet gibi fatura
          aboneliklerini kayıt altına alın ve aylık tahmini giderleri takip
          edin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard/subscriptions
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Yeni Abonelik Formu
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-52">
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
                  f: "Mülk",
                  d: "Aboneliğin hangi mülke ait olduğu (dropdown)",
                  z: "✓",
                },
                {
                  f: "Abonelik Türü",
                  d: "Elektrik, Su, Doğalgaz, İnternet, Sigorta, Diğer",
                  z: "✓",
                },
                { f: "Abone Adı", d: "Abonelik sahibinin adı", z: "" },
                {
                  f: "Abone Numarası",
                  d: "Sayaç veya müşteri numarası",
                  z: "",
                },
                { f: "Tedarikçi", d: "Kurum adı (örn: AYEDAŞ, İGDAŞ)", z: "" },
                {
                  f: "Sözleşme Numarası",
                  d: "Tedarikçi sözleşme numarası",
                  z: "",
                },
                {
                  f: "Tahmini Aylık Tutar",
                  d: "Ortalama aylık gider tutarı",
                  z: "",
                },
                { f: "Para Birimi", d: "Varsayılan: TRY", z: "" },
                {
                  f: "Başlangıç Tarihi",
                  d: "Abonelik başlangıç tarihi",
                  z: "",
                },
                {
                  f: "Bitiş Tarihi",
                  d: "Abonelik bitiş tarihi (belirli süreli ise)",
                  z: "",
                },
                { f: "Aktif", d: "Pasif yapılırsa listede grileşir", z: "" },
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
          <strong>Buton:</strong> <em>Kaydet</em> — Abonelik mülke bağlanır;
          mülk detay sayfasında da listelenecektir.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Abonelik Listesi</h2>
        <p className="text-sm text-slate-600">
          Tüm mülklerdeki abonelikler tek ekranda görünür. Mülk adı, tür,
          tedarikçi, tahmini aylık tutar ve aktiflik durumu sütunları
          listelenir. Düzenle ve sil işlemleri her satırda kullanılabilir.
        </p>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/emlak/belgeler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Belgeler
        </Link>
        <Link
          href="/docs"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Docs Ana Sayfa ↑
        </Link>
      </div>
    </article>
  );
}
