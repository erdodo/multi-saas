import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mülkler — MultiSaaS Docs" };

export default function MulklerPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Mülkler</h1>
        <p className="text-slate-500 leading-relaxed">
          Portföyünüzdeki tüm gayrimenkulleri kayıt altına alın, filtreleyin ve
          yönetin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard/properties
        </p>
      </div>

      {/* Filtreler */}
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
                  Seçenekler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Arama
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Başlık, adres, şehir veya ilçeye göre metin araması
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Durum
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {["Müsait", "Kirada", "Satılık", "Satıldı", "Bakımda"].map(
                      (s) => (
                        <span
                          key={s}
                          className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ),
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Tür</td>
                <td className="px-4 py-2.5 text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Daire",
                      "Müstakil",
                      "Arsa",
                      "Dükkan",
                      "Ofis",
                      "Diğer",
                    ].map((t) => (
                      <span
                        key={t}
                        className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Yeni Mülk Formu */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Yeni Mülk Formu</h2>
        <p className="text-sm text-slate-600">
          <strong>Mülk Ekle</strong> butonu ile form açılır. Alanlar:
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
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-20">
                  Zorunlu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {
                  f: "Başlık",
                  d: "Mülkü tanımlayan kısa isim (örn: Kadıköy 2+1)",
                  z: "✓",
                },
                {
                  f: "Tür",
                  d: "Daire / Müstakil / Arsa / Dükkan / Ofis / Diğer",
                  z: "✓",
                },
                {
                  f: "Durum",
                  d: "Müsait / Kirada / Satılık / Satıldı / Bakımda",
                  z: "✓",
                },
                {
                  f: "Mal Sahibi",
                  d: "Daha önce tanımlanmış sahiplerden seçim",
                  z: "",
                },
                {
                  f: "Şehir / İlçe / Mahalle",
                  d: "Coğrafi konum bilgisi",
                  z: "",
                },
                { f: "Adres", d: "Tam sokak adresi", z: "" },
                { f: "Posta Kodu", d: "", z: "" },
                { f: "Metrekare", d: "Brüt alan (m²)", z: "" },
                { f: "Oda Sayısı", d: "Metin formatı: 2+1, 3+1 vb.", z: "" },
                { f: "Kat No / Toplam Kat", d: "Bina kat bilgisi", z: "" },
                { f: "Bina Yaşı", d: "Yıl olarak", z: "" },
                {
                  f: "Isıtma Tipi",
                  d: "Örn: Kombi, Merkezi, Yerden Isıtma",
                  z: "",
                },
                {
                  f: "Özellikler",
                  d: "Asansör, Eşyalı, Otopark, Balkon (checkbox)",
                  z: "",
                },
                {
                  f: "Satın Alma Fiyatı / Tarihi",
                  d: "Portföy değer takibi için",
                  z: "",
                },
                { f: "Piyasa Değeri", d: "Güncel tahminî değer", z: "" },
                { f: "Notlar", d: "Serbest metin notları", z: "" },
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
          <strong>Buton:</strong> <em>Kaydet</em> — Mülk oluşturulur ve listeye
          eklenir.
        </div>
      </section>

      {/* Silme kısıtlaması */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Silme Kısıtlaması</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Aktif kira sözleşmesi olan mülk silinemez.</strong> Silmek
          için önce ilgili sözleşmeyi sonlandırın; mülk durumu otomatik olarak{" "}
          <em>Müsait</em>'e döner.
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/emlak/genel-bakis"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Genel Bakış
        </Link>
        <Link
          href="/docs/emlak/kiracilar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Kiracılar →
        </Link>
      </div>
    </article>
  );
}
