import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Raporlar — MultiSaaS Docs" };

export default function RaporlarPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Raporlar
        </h1>
        <p className="text-slate-500 leading-relaxed">
          İşletmenizin performansını gelir, randevu sayısı ve iptal oranı
          metrikleriyle takip edin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/reports
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Metrikler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: "💰",
              label: "Toplam Gelir",
              desc: "Tamamlanan randevuların toplam tutarı",
            },
            {
              icon: "📅",
              label: "Toplam Randevu",
              desc: "Seçilen dönemdeki tüm randevu sayısı",
            },
            {
              icon: "✅",
              label: "Tamamlanma Oranı",
              desc: "Tamamlanan / toplam randevu yüzdesi",
            },
            {
              icon: "❌",
              label: "İptal Oranı",
              desc: "İptal edilen randevuların yüzdesi",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <span className="text-2xl">{m.icon}</span>
              <p className="font-semibold text-slate-900 text-sm mt-2">
                {m.label}
              </p>
              <p className="text-xs text-slate-400">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Dönem Filtresi</h2>
        <p className="text-sm text-slate-600">
          Tarih aralığı seçerek raporları özelleştirebilirsiniz:{" "}
          <em>Bu Hafta</em>, <em>Bu Ay</em>,<em>Son 3 Ay</em> gibi hızlı
          seçenekler veya özel tarih aralığı kullanılabilir.
        </p>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/personel"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Personel
        </Link>
        <Link
          href="/docs/randevu/panel-ayarlari"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Panel Ayarları →
        </Link>
      </div>
    </article>
  );
}
