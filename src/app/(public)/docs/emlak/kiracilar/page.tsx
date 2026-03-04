import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kiracılar — MultiSaaS Docs" };

export default function KiracilarPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Kiracılar
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Mülklerinizde ikamet eden veya etmiş olan kiracıların kayıtlarını
          yönetin. Kiracılar sözleşmelere bağlıdır; aynı kişi birden fazla
          sözleşmede görünebilir.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard/tenants
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Kiracı Listesi</h2>
        <p className="text-sm text-slate-600">
          Tüm kiracılar listelenir. Her satırda ad soyad, aktif kiradaki mülk
          (varsa) ve toplam sözleşme sayısı gösterilir. Arama kutusuyla ad,
          telefon, e-posta veya TC No'ya göre filtreleme yapılır.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Yeni Kiracı Formu</h2>
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
                { f: "Ad", d: "Kiracının adı (min 2 karakter)", z: "✓" },
                { f: "Soyad", d: "Kiracının soyadı (min 2 karakter)", z: "✓" },
                { f: "TC Kimlik No", d: "Kimlik doğrulama için", z: "" },
                { f: "Telefon 1", d: "Birincil iletişim numarası", z: "" },
                { f: "Telefon 2", d: "İkinci iletişim numarası", z: "" },
                { f: "E-posta", d: "Geçerli e-posta formatı", z: "" },
                {
                  f: "Acil Durum Kişisi",
                  d: "Acil durumda ulaşılacak kişi adı",
                  z: "",
                },
                { f: "Acil Durum Telefonu", d: "Acil kişinin telefonu", z: "" },
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
          <strong>Buton:</strong> <em>Kaydet</em> — Kiracı oluşturulur ve
          sözleşme formunda seçilebilir hale gelir.
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Silme Kısıtlaması</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Aktif kira sözleşmesi olan kiracı silinemez.</strong>{" "}
          Sözleşmeyi önce sonlandırın.
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/emlak/mulkler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Mülkler
        </Link>
        <Link
          href="/docs/emlak/sozlesmeler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Sözleşmeler →
        </Link>
      </div>
    </article>
  );
}
