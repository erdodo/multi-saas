import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uygulama Paneli — MultiSaaS Docs",
};

export default function PanelPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
          Uygulama Paneli
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Uygulamalar
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Giriş yaptıktan sonra yönlendirilen ana panel sayfasıdır. Kurulum
          sırasında seçtiğiniz tüm modüller burada kart olarak listelenir.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/app
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Modül Kartları</h2>
        <p className="text-sm text-slate-600">
          Her kartın üzerine tıklayarak ilgili modüle geçersiniz. Kartlarda
          modülün adı, kısa açıklaması ve <em>Modüle Git</em> bağlantısı yer
          alır.
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Modül
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  İkon Rengi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Randevu
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Randevu yönetim sistemi
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-1" />
                  İndigo
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Emlak
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Gayrimenkul yönetimi
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1" />
                  Yeşil
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Ders</td>
                <td className="px-4 py-2.5 text-slate-500">
                  Eğitim takip sistemi
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1" />
                  Turuncu
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Yeni Modül Ekleme</h2>
        <p className="text-sm text-slate-600">
          Modüller listesinin sonunda <strong>Yeni Modül Ekle</strong> kartı
          bulunur. Bu kart, ileride mağaza entegrasyonu için ayrılmıştır; şu an
          tıklanabilir değildir.
        </p>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/giris"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Giriş Yapma
        </Link>
        <Link
          href="/docs/ayarlar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Ayarlar →
        </Link>
      </div>
    </article>
  );
}
