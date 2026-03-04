import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mal Sahipleri — MultiSaaS Docs" };

export default function MalSahipleriPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Mal Sahipleri
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Portföyünüzdeki mülklerin sahiplerini kayıt altına alın. Her mülk bir
          mal sahibine bağlanabilir; bu bilgi sözleşme ve raporlarda kullanılır.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard/owners
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Yeni Mal Sahibi Formu
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
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-20">
                  Zorunlu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { f: "Ad", d: "Min 2 karakter", z: "✓" },
                { f: "Soyad", d: "Min 2 karakter", z: "✓" },
                { f: "TC Kimlik No", d: "Gerçek kişi kimlik numarası", z: "" },
                { f: "Vergi No", d: "Tüzel kişiler için", z: "" },
                { f: "Telefon 1", d: "Birincil iletişim", z: "" },
                { f: "Telefon 2", d: "İkinci iletişim", z: "" },
                { f: "E-posta", d: "Geçerli e-posta formatı", z: "" },
                { f: "Adres", d: "İkametgah adresi", z: "" },
                {
                  f: "Banka Adı",
                  d: "Kira ödemelerinin yapılacağı banka",
                  z: "",
                },
                { f: "IBAN", d: "TR formatında IBAN", z: "" },
                { f: "Hesap Sahibi Adı", d: "Banka hesabındaki isim", z: "" },
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
          <strong>Buton:</strong> <em>Kaydet</em> — Mal sahibi oluşturulduktan
          sonra Mülk ve Sözleşme formlarındaki sahip dropdown'ında görünür.
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Silme Kısıtlaması</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Mülkleri olan bir mal sahibi silinemez.</strong> Önce bu
          sahibe ait mülkleri başka bir sahibe atayın veya mülkleri silin.
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/emlak/odemeler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Ödemeler
        </Link>
        <Link
          href="/docs/emlak/belgeler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Belgeler →
        </Link>
      </div>
    </article>
  );
}
