import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yapma — MultiSaaS Docs",
};

export default function GirisPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
          Başlarken
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Giriş Yapma
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Kayıtlı hesabınızla platforma giriş yapın. Giriş sonrası middleware,
          kurulum durumunuza göre sizi otomatik olarak doğru sayfaya
          yönlendirir.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Giriş Formu</h2>
        <p className="text-sm text-slate-600">
          <code className="bg-slate-100 px-1 rounded text-xs">/login</code>{" "}
          adresine gidin.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-36">
                  Alan
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  E-posta
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Kayıt sırasında kullandığınız e-posta
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Şifre
                </td>
                <td className="px-4 py-2.5 text-slate-500">Hesap şifreniz</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Buton:</strong> <em>Giriş Yap</em> — Kimlik bilgileri
          doğrulanırsa yönlendirme başlar.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Otomatik Yönlendirme
        </h2>
        <div className="space-y-2">
          {[
            { durum: "Kurulum tamamlanmamış", hedef: "/setup" },
            {
              durum: "Kurulum tamamlanmış",
              hedef: "/{tenantSlug}/app — Uygulama paneli",
            },
          ].map((r) => (
            <div
              key={r.durum}
              className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4"
            >
              <span className="text-slate-400 text-xs font-mono mt-0.5 w-5">
                →
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">{r.durum}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {r.hedef}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Hata Senaryosu</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>E-posta veya şifre hatalı.</strong> — Bilgiler yanlış
          girildiğinde kırmızı bir hata mesajı gösterilir ve form yeniden
          doldurulabilir.
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/kayit"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Kayıt & Kurulum
        </Link>
        <Link
          href="/docs/panel"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Uygulama Paneli →
        </Link>
      </div>
    </article>
  );
}
