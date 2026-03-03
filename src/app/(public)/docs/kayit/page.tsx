import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt & Kurulum — MultiSaaS Docs",
};

export default function KayitPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
          Başlarken
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Kayıt & Kurulum
        </h1>
        <p className="text-slate-500 leading-relaxed">
          MultiSaaS'a kayıt olmak ücretsizdir. Aşağıdaki adımları izleyerek
          birkaç dakika içinde işletmenizi yönetmeye başlayabilirsiniz.
        </p>
      </div>

      {/* Adım 1 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
            1
          </span>
          Kayıt Ol Sayfası
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Ana sayfa sağ üstündeki <strong>Kayıt Ol</strong> butonuna veya
          doğrudan{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">/register</code>{" "}
          adresine gidin.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-500">
              FORM ALANLARI
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
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
              <tr>
                <td className="px-4 py-2.5 text-slate-900 font-medium">
                  İşletme Adı
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Şirket veya işletme adınız (örn: Yıldız Kuaför)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-900 font-medium">
                  Ad Soyad
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Hesap sahibinin tam adı
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-900 font-medium">
                  E-posta
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Giriş için kullanılacak e-posta adresi
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-900 font-medium">
                  Şifre
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  En az 6 karakter olmalıdır
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Buton:</strong> <em>Kayıt Ol ve Devam Et</em> — Form eksiksiz
          doldurulduğunda kayıt tamamlanır ve otomatik olarak kurulum sayfasına
          yönlendirilirsiniz.
        </div>
      </section>

      {/* Adım 2 */}
      <section id="kurulum" className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
            2
          </span>
          Kurulum Sihirbazı
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Kayıt sonrası otomatik olarak{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">/setup</code>{" "}
          sayfasına yönlendirilirsiniz. Bu sayfada iki şey yapmanız gerekir:
        </p>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-2">
              📦 Modül Seçimi
            </h3>
            <p className="text-sm text-slate-500 mb-3">
              Kullanmak istediğiniz modülleri seçin. Birden fazla
              seçebilirsiniz.
            </p>
            <div className="space-y-2">
              {[
                {
                  key: "Randevu",
                  icon: "✂️",
                  desc: "Berber, güzellik salonu, klinik gibi randevu tabanlı işletmeler için",
                },
                {
                  key: "Emlak",
                  icon: "🏠",
                  desc: "Gayrimenkul danışmanları ve emlak ofisleri için",
                },
                {
                  key: "Ders",
                  icon: "🎓",
                  desc: "Öğretmenler ve eğitim merkezleri için",
                },
              ].map((m) => (
                <div
                  key={m.key}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-lg">{m.icon}</span>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {m.key}
                    </p>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-2">
              🔗 İşletme URL Adresi
            </h3>
            <p className="text-sm text-slate-500 mb-3">
              Müşterilerinizin online randevu alacağı özel adresinizi
              belirleyin.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700">
              multiapp.com/
              <span className="text-blue-600 font-semibold">
                isletme-adiniz
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Sadece küçük harf, rakam ve tire (-) kullanabilirsiniz. Minimum 2,
              maksimum 50 karakter.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Buton:</strong> <em>Kurulumu Tamamla ve Panele Geç</em> — En
          az bir modül seçilmeden bu buton pasif kalır. Tıklandığında uygulama
          paneline yönlendirilirsiniz.
        </div>
      </section>

      {/* Hata senaryoları */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Olası Hatalar</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Hata
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Neden?
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-2.5 text-red-600 font-medium">
                  Bu e-posta zaten kayıtlı
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Aynı e-posta ile daha önce kayıt yapılmış
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-red-600 font-medium">
                  Lütfen en az bir modül seçin
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Kurulum formunda modül seçimi yapılmamış
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-red-600 font-medium">
                  Bu URL adresi zaten kullanımda
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Seçilen slug başka bir işletme tarafından alınmış
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span />
        <Link
          href="/docs/giris"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Giriş Yapma →
        </Link>
      </div>
    </article>
  );
}
