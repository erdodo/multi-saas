import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel Ayarları — MultiSaaS Docs" };

const Section = ({
  title,
  rows,
}: {
  title: string;
  rows: { f: string; d: string }[];
}) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-56">
              Ayar
            </th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
              Açıklama
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
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
);

export default function PanelAyarlariPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Panel Ayarları
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Online rezervasyon davranışını, iş saatlerini, bildirimleri ve marka
          görünümünü yapılandırın.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/settings
        </p>
      </div>

      <Section
        title="Rezervasyon Politikası"
        rows={[
          {
            f: "Rezervasyon Penceresi (gün)",
            d: "Müşteriler kaç gün ileriye randevu alabilsin? Varsayılan: 60 gün",
          },
          {
            f: "Min. Önceden Bildirim (saat)",
            d: "Randevudan en az kaç saat önce alınabilir? Varsayılan: 2 saat",
          },
          {
            f: "Slot Aralığı (dakika)",
            d: "Müsait saat dilimlerinin aralığı. Seçenekler: 10 / 15 / 20 / 30 / 60 dk. Varsayılan: 15 dk",
          },
          {
            f: "Otomatik Onayla",
            d: "Açık: yeni randevular anında Onaylı olur. Kapalı: işletme onayı gerekir",
          },
        ]}
      />

      <Section
        title="İş Saatleri"
        rows={[
          {
            f: "Açılış Saati",
            d: "İşletmenin genel açılış saati (ör. 09:00). Personel bazında çalışma saatleri bu saati geçersiz kılabilir.",
          },
          {
            f: "Kapanış Saati",
            d: "İşletmenin genel kapanış saati (ör. 18:00)",
          },
        ]}
      />

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Tatil Günleri</h2>
        <p className="text-sm text-slate-600">
          İşletmenin kapalı olduğu günleri (resmi tatil, özel kapanış vb.)
          tanımlayın. Tatil günlerinde online rezervasyon formunda slot
          üretilmez; o güne randevu alınamaz.
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-32">
                  Alan
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { f: "Ad", d: 'Tatil açıklaması (ör. "Ulusal Bayram")' },
                { f: "Tarih", d: "Kapalı olunacak gün (YYYY-MM-DD)" },
              ].map((r) => (
                <tr key={r.f}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.f}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600">
          Eklenen tatiller listede görünür ve tek tıkla silinebilir.
        </p>
      </section>

      <Section
        title="Bildirimler"
        rows={[
          {
            f: "E-posta Bildirimi",
            d: "Randevu oluşturulduğunda / iptal edildiğinde e-posta gönder",
          },
          {
            f: "SMS Bildirimi",
            d: "Randevu oluşturulduğunda / iptal edildiğinde SMS gönder",
          },
          {
            f: "Hatırlatma (saat önce)",
            d: "Randevudan kaç saat önce hatırlatma gönderilsin? (ör. 24 saat)",
          },
        ]}
      />

      <Section
        title="Marka Rengi"
        rows={[
          {
            f: "Ana Renk (primaryColor)",
            d: "Online rezervasyon formu ve admin panelindeki vurgu rengi. Color picker ile seçilir.",
          },
        ]}
      />

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">İptal Politikası</h2>
        <p className="text-sm text-slate-600">
          Müşterilerin kendi randevularını iptal veya erteleyebilmesi için
          gereken minimum süreleri belirleyin.
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-56">
                  Ayar
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  f: "İptal Min. Süre (saat)",
                  d: "Randevudan en az kaç saat önce iptal yapılabilir? Varsayılan: 12 saat",
                },
                {
                  f: "Erteleme Min. Süre (saat)",
                  d: "Randevudan en az kaç saat önce erteleme yapılabilir? Varsayılan: 4 saat",
                },
                {
                  f: "Misafir İptali",
                  d: "Kayıt gerektirmeden (misafir olarak) oluşturulan randevuların iptal edilmesine izin ver",
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

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Kaydet</strong> — Değişiklikler kaydedildikten sonra yeni
        rezervasyonları ve mevcut slot hesaplamalarını hemen etkiler.
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/raporlar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Raporlar
        </Link>
        <Link
          href="/docs/randevu/online-rezervasyon"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Online Rezervasyon →
        </Link>
      </div>
    </article>
  );
}
