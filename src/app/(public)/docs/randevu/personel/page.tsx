import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Personel — MultiSaaS Docs" };

export default function PersonelPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Personel
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Çalışanlarınızı tanımlayın, sundukları hizmetleri ve çalışma
          saatlerini belirleyin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/staff
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Personel Listesi</h2>
        <p className="text-sm text-slate-600">
          Tüm personel kartlarla listelenir. Her kartda çalışanın adı, rengi ve
          atanmış hizmet sayısı görünür.
        </p>
        <p className="text-sm text-slate-600">
          <strong>Yeni Personel Ekle</strong> butonu sizi{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">/staff/new</code>{" "}
          sayfasına yönlendirir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Yeni Personel Formu
        </h2>
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
                { f: "Ad Soyad", d: "Çalışanın tam adı" },
                { f: "Bio", d: "Kısa tanıtım yazısı (isteğe bağlı)" },
                { f: "Renk", d: "Takvimde görünecek kişiye özel renk" },
                {
                  f: "Sunduğu Hizmetler",
                  d: "Bu personelin yapabileceği hizmetler (çoklu seçim)",
                },
                { f: "Çalışma Günleri", d: "Haftanın hangi günleri çalıştığı" },
                {
                  f: "Aktif",
                  d: "Pasif yapılırsa rezervasyon formunda listelenmez",
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
          <strong>Buton:</strong> <em>Kaydet</em> — Form eksiksiz
          doldurulduğunda personel oluşturulur ve listeye eklenir.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Personel Detay / Düzenleme
        </h2>
        <p className="text-sm text-slate-600">
          Listeden bir personel kartına tıklandığında{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">
            /staff/{"{id}"}
          </code>{" "}
          sayfası açılır. Bilgiler düzenlenebilir ve Çalışma Saatleri bölümünden
          gün bazlı saat aralıkları ayarlanabilir.
        </p>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/hizmetler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Hizmetler
        </Link>
        <Link
          href="/docs/randevu/raporlar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Raporlar →
        </Link>
      </div>
    </article>
  );
}
