import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Müşteriler — MultiSaaS Docs" };

export default function MusterilerPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Müşteriler
        </h1>
        <p className="text-slate-500 leading-relaxed">
          İşletmenize randevu almış tüm müşterilerin listesini görüntüleyin ve
          arayın.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/customers
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Arama</h2>
        <p className="text-sm text-slate-600">
          Ad, e-posta veya telefon numarasına göre anlık arama yapılır.
          <strong> Ara</strong> butonuna tıklandığında sonuçlar güncellenir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Müşteri Tablosu</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Sütun
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { col: "Müşteri", info: "Ad, soyad ve e-posta adresi" },
                { col: "Telefon", info: "Kayıtlı telefon numarası" },
                { col: "Randevu", info: "Toplam randevu sayısı" },
                { col: "Durum", info: "Aktif (yeşil) veya Engelli (kırmızı)" },
                { col: "Detay", info: "Kısaltılmış müşteri ID'si" },
              ].map((r) => (
                <tr key={r.col}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.col}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.info}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Engelli Müşteri</h2>
        <p className="text-sm text-slate-600">
          Durum sütununda{" "}
          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
            Engelli
          </span>{" "}
          ibaresi görünen müşteriler sisteme yeni randevu oluşturamaz.
        </p>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/takvim"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Takvim
        </Link>
        <Link
          href="/docs/randevu/hizmetler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Hizmetler →
        </Link>
      </div>
    </article>
  );
}
