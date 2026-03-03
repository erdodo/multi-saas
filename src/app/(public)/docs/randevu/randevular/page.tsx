import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Randevular — MultiSaaS Docs",
};

export default function RandevularPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Randevular
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Tüm randevuları listeleyin, filtreleyin ve yönetin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/appointments
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Filtre Araçları</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Filtre
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Müşteri Ara
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  İsim veya telefona göre metin araması
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Durum
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Tüm Durumlar, Bekliyor, Onaylı, Tamamlandı, İptal
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Başlangıç Tarihi
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Tarih aralığı başlangıcı
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Bitiş Tarihi
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Tarih aralığı bitişi
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500">
          <strong>Filtrele</strong> butonu sorguyu uygular. Sayfa başına 20
          randevu görüntülenir; alt pagination ile önceki/sonraki sayfalara
          geçilir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Tablo Sütunları</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-32">
                  Sütun
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Gösterilen Bilgi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {
                  col: "Müşteri",
                  info: "Ad soyad ve telefon (misafir veya kayıtlı müşteri)",
                },
                {
                  col: "Hizmet",
                  info: "Randevu alınan hizmet adı (renkli nokta ile)",
                },
                { col: "Uzman", info: "Atanan personel" },
                { col: "Tarih & Saat", info: "Gün, ay, yıl ve saat" },
                {
                  col: "Durum",
                  info: "Renkli badge: Bekliyor, Onaylı, Tamamlandı, İptal",
                },
                { col: "İşlemler", info: "Durum değiştirme butonları" },
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

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Randevu Durumları</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Bekliyor", color: "bg-yellow-100 text-yellow-700" },
            { label: "Onaylı", color: "bg-green-100 text-green-700" },
            { label: "Tamamlandı", color: "bg-blue-100 text-blue-700" },
            { label: "İptal", color: "bg-red-100 text-red-700" },
            { label: "Gelmedi", color: "bg-slate-100 text-slate-600" },
          ].map((s) => (
            <span
              key={s.label}
              className={`text-xs px-3 py-1 rounded-full font-semibold ${s.color}`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">İşlem Butonları</h2>
        <p className="text-sm text-slate-600">
          Her satırın sağındaki <strong>İşlemler</strong> hücresinde, geçerli
          duruma göre uygun aksiyonlar gösterilir:
        </p>
        <div className="space-y-2">
          {[
            {
              action: "Onayla",
              desc: "Bekleyen randevuyu onaylı duruma getirir",
            },
            {
              action: "Tamamlandı",
              desc: "Randevuyu tamamlanmış olarak işaretler",
            },
            { action: "İptal Et", desc: "Randevuyu iptal eder" },
            { action: "Gelmedi", desc: "Müşterinin gelmediğini kaydeder" },
          ].map((a) => (
            <div key={a.action} className="flex items-start gap-2 text-sm">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs shrink-0 mt-0.5">
                {a.action}
              </span>
              <span className="text-slate-500">{a.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/genel-bakis"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Genel Bakış
        </Link>
        <Link
          href="/docs/randevu/takvim"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Takvim →
        </Link>
      </div>
    </article>
  );
}
