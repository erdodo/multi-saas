import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sözleşmeler — MultiSaaS Docs" };

export default function SozlesmelerPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Sözleşmeler
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Kira sözleşmeleri oluşturun ve yönetin. Sözleşme oluşturulduğunda
          aylık ödeme takvimi otomatik olarak üretilir ve mülk durumu{" "}
          <em>Kirada</em> olarak güncellenir.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard/leases
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Sözleşme Listesi</h2>
        <p className="text-sm text-slate-600">
          Durum filtresine göre sözleşmeleri görüntüleyin:{" "}
          <strong>Aktif</strong>, <strong>Sona Erdi</strong>,
          <strong>Feshedildi</strong>. Her satırda mülk, kiracı, mal sahibi,
          başlangıç/bitiş tarihi, kira tutarı ve gecikmiş ödeme sayısı
          gösterilir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Yeni Sözleşme Formu
        </h2>
        <p className="text-sm text-slate-600">
          <strong>Sözleşme Ekle</strong> butonuna tıklayın.
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-48">
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
                  d: "Sözleşme bağlanacak aktif mülk (dropdown)",
                  z: "✓",
                },
                {
                  f: "Kiracı",
                  d: "Sistemde kayıtlı kiracı (dropdown)",
                  z: "✓",
                },
                {
                  f: "Mal Sahibi",
                  d: "İsteğe bağlı — mülk sahibi seçimi",
                  z: "",
                },
                { f: "Başlangıç Tarihi", d: "YYYY-MM-DD formatı", z: "✓" },
                {
                  f: "Bitiş Tarihi",
                  d: "Başlangıçtan sonra olmalıdır",
                  z: "✓",
                },
                {
                  f: "Kira Tutarı",
                  d: "Aylık kira bedeli (pozitif sayı)",
                  z: "✓",
                },
                { f: "Para Birimi", d: "Varsayılan: TRY", z: "" },
                {
                  f: "Ödeme Günü",
                  d: "Ayın kaçında ödeme yapılacak (1–31)",
                  z: "✓ Varsayılan: 1",
                },
                {
                  f: "Depozito Tutarı",
                  d: "0 veya üzeri; varsayılan: 0",
                  z: "",
                },
                { f: "Depozito Ödendi mi?", d: "Checkbox", z: "" },
                {
                  f: "Sözleşme URL",
                  d: "Belge bağlantısı (isteğe bağlı)",
                  z: "",
                },
                {
                  f: "Otomatik Yenileme",
                  d: "Bitiş sonrası sözleşme yenilensin mi?",
                  z: "",
                },
                {
                  f: "Yenileme Oranı (%)",
                  d: "Yenileme kira artış yüzdesi",
                  z: "",
                },
                { f: "Notlar", d: "Serbest metin notları", z: "" },
              ].map((r) => (
                <tr key={r.f}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.f}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.d}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600 font-bold text-xs">
                    {r.z}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <strong>Otomatik İşlemler (sözleşme oluşturulunca):</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>
              Başlangıç → bitiş tarihleri arasında ödeme günü baz alınarak aylık
              ödeme takvimi otomatik oluşturulur
            </li>
            <li>
              Mülk durumu <strong>Kirada</strong> olarak güncellenir
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Kısıtlama:</strong> Aynı mülk için zaten <em>Aktif</em> bir
          sözleşme varken yeni sözleşme oluşturulamaz. Önce mevcut sözleşme
          sonlandırılmalıdır.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Sözleşme Sonlandırma
        </h2>
        <p className="text-sm text-slate-600">
          Sözleşme detayından <strong>Sözleşmeyi Sonlandır</strong> butonuna
          tıklanır.
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-44">
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
                  f: "Sonlandırma Türü",
                  d: "Sona Erdi (normal bitiş) / Feshedildi (erken bitiş)",
                },
                { f: "Fesih Sebebi", d: "İsteğe bağlı metin açıklaması" },
                {
                  f: "Depozito İade Tarihi",
                  d: "Depozitonun iade edildiği tarih",
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
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <strong>Otomatik İşlemler (sonlandırma sonrası):</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>
              Bekleyen ödemeler <strong>Gecikmiş</strong> durumuna çekilir
            </li>
            <li>
              Mülk durumu <strong>Müsait</strong>'e döner
            </li>
          </ul>
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/emlak/kiracilar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Kiracılar
        </Link>
        <Link
          href="/docs/emlak/odemeler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Ödemeler →
        </Link>
      </div>
    </article>
  );
}
