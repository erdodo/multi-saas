import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Rezervasyon Formu — MultiSaaS Docs",
};

export default function OnlineRezervasyonPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Online Randevu
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Online Rezervasyon Formu
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Müşterileriniz herhangi bir hesap açmadan bu sayfa üzerinden randevu
          alabilir. Sayfaya giriş gerekmez; herkese açıktır.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/book
        </p>
      </div>

      {/* Sayfa Başlığı */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Sayfa Başlığı</h2>
        <p className="text-sm text-slate-600">
          Üstte işletme logosu (veya baş harfi), işletme adı ve adres
          gösterilir. Tüm renkler ve görsel kimlik{" "}
          <strong>Marka Ayarlarından</strong> otomatik uygulanır.
        </p>
      </section>

      {/* Rezervasyon Akışı */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Rezervasyon Akışı — 4 Adım
        </h2>
        <p className="text-sm text-slate-600">
          Her adımda geri dönülebilir. İlerleme çubuğu her zaman görünür.
        </p>
        <ol className="space-y-3">
          {[
            {
              step: "1",
              title: "Hizmet Seç",
              desc: "Aktif hizmetler kart olarak listelenir. Hizmet adı, süre (dk) ve fiyat her kartta gösterilir.",
            },
            {
              step: "2",
              title: "Personel / Uzman Seç",
              desc: "Seçilen hizmeti sunabilen personel listelenir. Her kart personelin adı ve biyografisini içerir.",
            },
            {
              step: "3",
              title: "Tarih & Saat Seç ✦",
              desc: "Animasyonlu aylık takvim açılır. Geçmiş günler ve rezervasyon penceresi dışı günler seçilemez. Bir güne tıklandığında animasyonlu geçişle gün görünümüne geçilir ve müsait saatler grid olarak listelenir. Dolu saatler (randevu, izin, mola) gri ve seçilemez durumda gösterilir.",
            },
            {
              step: "4",
              title: "Bilgi Gir ve Onayla ✦",
              desc: "Ad soyad (zorunlu), telefon (zorunlu, 0XXX XXX XX XX formatında otomatik maske) ve e-posta (isteğe bağlı, blur'da format kontrolü) girilir. «Randevuyu Onayla» butonu ile randevu oluşturulur.",
            },
          ].map((s) => (
            <li
              key={s.step}
              className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4"
            >
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{s.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
          <strong>✦ Yeni:</strong> Tarih/saat seçimi artık iki adım yerine tek
          animasyonlu ekranda gerçekleşir. Telefon alanı otomatik maske uygular.
        </div>
      </section>

      {/* Onay Sayfası */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Randevu Onay Sayfası ✦
        </h2>
        <p className="text-sm text-slate-600">
          Rezervasyon tamamlandığında müşteri otomatik olarak onay sayfasına
          yönlendirilir:
        </p>
        <p className="text-xs text-slate-400 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/book/{"{randevuId}"}
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-36">
                  Bölüm
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Detay
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  f: "Durum Badge",
                  d: "Bekliyor / Onaylandı / İptal gibi renkli etiket",
                },
                {
                  f: "Randevu Detayı",
                  d: "Hizmet, uzman, tarih & saat, ad soyad, konum (varsa), not",
                },
                {
                  f: "QR Kod ✦",
                  d: "Server-side üretilir. Müşteri, QR kodu taratarak randevusuna ulaşabilir.",
                },
                {
                  f: "Paylaş ✦",
                  d: "Web Share API ile paylaşım (desteklenmiyorsa link kopyalanır)",
                },
                {
                  f: "QR İndir ✦",
                  d: "PNG dosyası olarak cihaza kaydedilebilir",
                },
              ].map((r) => (
                <tr key={r.f}>
                  <td className="px-4 py-2.5 font-medium text-slate-900 align-top">
                    {r.f}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Randevu Sorgulama */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Randevu Sorgulama ✦
        </h2>
        <p className="text-sm text-slate-600">
          Müşteriler telefon numaralarıyla geçmiş randevularına ulaşabilir:
        </p>
        <p className="text-xs text-slate-400 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/sorgula
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-600 pl-2">
          <li>
            Telefon numarası girilir (0XXX XXX XX XX maskesi otomatik uygulanır)
          </li>
          <li>«Sorgula» butonuna tıklanır</li>
          <li>
            Eşleşen randevular kart olarak listelenir (hizmet, uzman, tarih,
            durum)
          </li>
          <li>Bir karta tıklanınca randevunun onay sayfası açılır</li>
        </ol>
      </section>

      {/* Onay Senaryoları */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Onay Senaryoları</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Ayar
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Sonuç
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-2.5 text-slate-900 font-medium">
                  Otomatik Onayla: Açık
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Randevu anında{" "}
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    Onaylı
                  </span>{" "}
                  olarak oluşturulur
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-900 font-medium">
                  Otomatik Onayla: Kapalı
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Randevu{" "}
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    Bekliyor
                  </span>{" "}
                  olarak oluşturulur; işletme onayı gerekir
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Hata Durumları */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Hata Durumları</h2>
        <div className="space-y-2">
          {[
            {
              h: "Hizmet bulunamadı",
              d: "İşletmede hiç aktif hizmet tanımlı değilse sayfa uyarı gösterir",
            },
            {
              h: "Seçilen saat doldu",
              d: "Başka biri aynı saati aldıysa form yenilenir ve dolu slot gösterilir",
            },
            {
              h: "Geçersiz e-posta formatı",
              d: "E-posta alanından çıkıldığında (blur) @ ve . kontrolü yapılır; geçersizse kırmızı uyarı gösterilir",
            },
            {
              h: "İşletme kurulumu tamamlanmamış",
              d: "Kurulum wizard henüz bitmediyse sayfa 404 döner",
            },
          ].map((e) => (
            <div
              key={e.h}
              className="flex items-start gap-2 text-sm bg-red-50 border border-red-100 rounded-xl p-3"
            >
              <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
              <div>
                <p className="font-medium text-red-700">{e.h}</p>
                <p className="text-red-500 text-xs mt-0.5">{e.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/panel-ayarlari"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Panel Ayarları
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
