import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Randevu Sorgulama — MultiSaaS Docs",
};

export default function RandevuSorgulamaPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Online Randevu
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Randevu Sorgulama
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Müşterileriniz telefon numaraları ile geçmiş ve gelecekteki tüm
          randevularına hesap açmadan ulaşabilir.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/sorgula
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Nasıl Çalışır?</h2>
        <ol className="space-y-3">
          {[
            {
              step: "1",
              title: "Telefon gir",
              desc: "Müşteri, randevu alırken kullandığı telefon numarasını girer. Alan otomatik olarak 0XXX XXX XX XX formatını uygular.",
            },
            {
              step: "2",
              title: "Sorgula",
              desc: "«Sorgula» butonuna tıklanır. Sistem hem misafir hem de kayıtlı müşteri kayıtlarında arama yapar.",
            },
            {
              step: "3",
              title: "Sonuçları gör",
              desc: "Eşleşen randevular kart olarak listelenir. Her kartta hizmet, uzman, tarih/saat ve durum bilgisi yer alır.",
            },
            {
              step: "4",
              title: "Randevu detayına git",
              desc: "Bir karta tıklanınca randevunun onay sayfası açılır. Buradan QR kod indirilebilir veya paylaşılabilir.",
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
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Randevu Onay Sayfası
        </h2>
        <p className="text-sm text-slate-600">
          Her randevunun kendine özel bir onay sayfası vardır:
        </p>
        <p className="text-xs text-slate-400 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/book/{"{randevuId}"}
        </p>
        <div className="space-y-2">
          {[
            {
              icon: "🏷️",
              label: "Durum",
              desc: "Bekliyor / Onaylandı / İptal — renkli badge",
            },
            {
              icon: "📋",
              label: "Randevu Detayı",
              desc: "Hizmet, uzman, tarih & saat, isim, konum",
            },
            {
              icon: "📱",
              label: "QR Kod",
              desc: "Ekran görüntüsü almak yerine QR kodu PNG olarak indirilebilir",
            },
            {
              icon: "🔗",
              label: "Paylaş",
              desc: "Fiziksel olarak veya mesajlaşma uygulamalarıyla paylaşılabilir",
            },
          ].map((r) => (
            <div
              key={r.label}
              className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-3 text-sm"
            >
              <span className="text-xl shrink-0">{r.icon}</span>
              <div>
                <p className="font-semibold text-slate-900">{r.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/online-rezervasyon"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Online Rezervasyon
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
