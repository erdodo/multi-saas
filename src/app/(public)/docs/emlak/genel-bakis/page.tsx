import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emlak Paneli — Genel Bakış — MultiSaaS Docs",
};

export default function EmlakGenelBakisPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Genel Bakış
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Emlak Paneli, mülklerinizi, kiracılarınızı, kira sözleşmelerinizi ve
          ödeme takibinizi tek ekrandan yönetmenize olanak tanır.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard
        </p>
      </div>

      {/* İstatistik Kartları */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Dashboard — İstatistik Kartları
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: "🏢",
              label: "Toplam Mülk",
              detail: "Kiraya verilen ve boş mülk sayısı (alt bilgi)",
            },
            {
              icon: "📄",
              label: "Aktif Sözleşme",
              detail: "Şu anda yürürlükte olan sözleşme sayısı",
            },
            {
              icon: "💵",
              label: "Bu Ay Beklenen",
              detail: "Bu ayki tahsil edilen / beklenen kira tutarı",
            },
            {
              icon: "⚠️",
              label: "Gecikmiş Ödeme",
              detail: "Vadesi geçmiş ödeme sayısı ve toplam tutarı",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <span className="text-2xl">{c.icon}</span>
              <p className="font-semibold text-slate-900 text-sm mt-2">
                {c.label}
              </p>
              <p className="text-xs text-slate-400">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Canlı Paneller */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Canlı Paneller</h2>
        <p className="text-sm text-slate-600">
          İstatistik kartlarının altında 3 canlı liste ve 1 hızlı erişim bölümü
          yer alır:
        </p>
        <div className="space-y-3">
          {[
            {
              icon: "⚠️",
              title: "Gecikmiş Ödemeler",
              desc: "Vadesi geçip henüz tahsil edilmemiş ödemeler. Her satırda mülk adı, kiracı, vade tarihi ve tutar gösterilir.",
              link: "Tümünü Gör → Ödemeler (status=OVERDUE)",
            },
            {
              icon: "⏰",
              title: "Yaklaşan Sözleşme Bitimleri",
              desc: "Önümüzdeki 60 gün içinde sona erecek sözleşmeler. Kalan gün sayısı renk kodlu badge ile gösterilir: ≤14 gün kırmızı, ≤30 gün sarı, diğerleri mavi.",
              link: "Tümünü Gör → Sözleşmeler",
            },
            {
              icon: "✅",
              title: "Son Tahsilatlar",
              desc: "En son tahsil edilen ödemeler. Mülk adı, ödeme tarihi ve tutar listelenir.",
              link: "Tümünü Gör → Ödemeler (status=PAID)",
            },
            {
              icon: "⚡",
              title: "Hızlı İşlemler",
              desc: "Sık kullanılan 4 kısayol: Mülk Ekle, Kiracı Ekle, Sözleşme Ekle, Ödeme Kaydet.",
              link: "",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{p.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {p.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                  {p.link && (
                    <p className="text-xs text-blue-500 mt-1">{p.link}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sidebar Nav */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Kenar Çubuğu Navigasyonu
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Bölüm
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  URL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { label: "Genel Bakış", path: "dashboard" },
                { label: "Mülkler", path: "dashboard/properties" },
                { label: "Kiracılar", path: "dashboard/tenants" },
                { label: "Sözleşmeler", path: "dashboard/leases" },
                { label: "Ödemeler", path: "dashboard/payments" },
                { label: "Mal Sahipleri", path: "dashboard/owners" },
                { label: "Belgeler", path: "dashboard/documents" },
                { label: "Abonelikler", path: "dashboard/subscriptions" },
              ].map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.label}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">
                    /{"{tenantSlug}"}/emlak-panel/{r.path}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/ayarlar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Ayarlar
        </Link>
        <Link
          href="/docs/emlak/mulkler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Mülkler →
        </Link>
      </div>
    </article>
  );
}
