import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Personel — MultiSaaS Docs" };

export default function PersonelPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Personel
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Çalışanlarınızı tanımlayın, sundukları hizmetleri, çalışma saatlerini,
          mola ve izin günlerini belirleyin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/staff
        </p>
      </div>

      {/* Personel Listesi */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Personel Listesi</h2>
        <p className="text-sm text-slate-600">
          Tüm personel kartlarla listelenir. Her kartta çalışanın adı, rengi ve
          atanmış hizmet sayısı görünür. <strong>Yeni Personel Ekle</strong>{" "}
          butonu sizi{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">/staff/new</code>{" "}
          sayfasına yönlendirir.
        </p>
      </section>

      {/* Yeni Personel Formu */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Yeni Personel Formu
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-44">
                  Bölüm
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  f: "Kişisel Bilgiler",
                  d: "Ad soyad, telefon, kısa biyografi, takvim rengi",
                },
                {
                  f: "Hizmetler",
                  d: "Bu personelin sunacağı hizmetler badge olarak seçilir. Listede hizmet yoksa «Hizmet tanımla» butonu ile formu terk etmeden yeni hizmet eklenebilir.",
                },
                {
                  f: "Çalışma Saatleri",
                  d: "Pazartesi–Pazar, gün bazında açık/kapalı toggle + başlangıç/bitiş saati",
                },
                {
                  f: "İzin Tanımla ✦",
                  d: "Tarih-saat aralığı ve isteğe bağlı sebep girilerek izin eklenir. Birden fazla izin tanımlanabilir. İzin aralığında rezervasyon alınamaz.",
                },
                {
                  f: "Mola Tanımla ✦",
                  d: "Haftanın belirli günleri için saatlik mola tanımlanır (ör. Pazartesi 12:00–13:00 «Öğle Arası»). Mola saatlerinde online rezervasyon formu o slotları dolu gösterir.",
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
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
          <strong>✦ Yeni özellik</strong> — İzin ve mola tanımlamaları personel
          oluşturulurken form üzerinde yapılır ve kayıtla birlikte sisteme
          işlenir.
        </div>
      </section>

      {/* Hızlı Hizmet Ekleme */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Hızlı Hizmet Ekleme ✦
        </h2>
        <p className="text-sm text-slate-600">
          Personel eklerken seçilecek hizmet yoksa{" "}
          <strong>«Hizmet tanımla»</strong> veya{" "}
          <strong>«+ Yeni hizmet»</strong> butonuna tıklayın. Açılan dialog'da
          ad, süre, fiyat ve renk girerek yeni hizmeti anında
          oluşturabilirsiniz. Oluşturulan hizmet otomatik olarak seçili gelir;
          formu kapatıp farklı bir sayfaya gitmenize gerek kalmaz.
        </p>
      </section>

      {/* Mola Yönetimi */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Mola Yönetimi ✦</h2>
        <p className="text-sm text-slate-600">
          Mola saatleri haftalık tekrar eden bloklar olarak tanımlanır:
        </p>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Alan
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { f: "Gün", d: "Pazartesi – Pazar" },
                { f: "Başlangıç Saati", d: "Mola başlangıcı (ör. 12:00)" },
                { f: "Bitiş Saati", d: "Mola bitişi (ör. 13:00)" },
                { f: "Etiket", d: "İsteğe bağlı açıklama (ör. «Öğle Arası»)" },
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
          Tanımlanan mola aralıkları müşteri rezervasyon formunda{" "}
          <strong>dolu</strong> olarak gösterilir ve seçilemez.
        </p>
      </section>

      {/* İzin Yönetimi */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">İzin Yönetimi ✦</h2>
        <p className="text-sm text-slate-600">
          İzin, tek seferlik bir tarih-saat aralığıdır (tatil, hastalık vb.).
          İzin süresince o personele randevu alınamaz. Personel düzenleme
          sayfasından da sonradan yeni izin eklenebilir.
        </p>
      </section>

      {/* Personel Detay / Düzenleme */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          Personel Detay / Düzenleme
        </h2>
        <p className="text-sm text-slate-600">
          Listeden bir personel kartına tıklandığında{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">
            /staff/{"{id}"}
          </code>{" "}
          sayfası açılır. Bu sayfadan:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 pl-2">
          <li>Çalışma günleri ve saatleri düzenlenip kaydedilebilir</li>
          <li>Yeni izin kaydı eklenebilir ve mevcut izinler listelenir</li>
        </ul>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/hizmetler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Hizmetler
        </Link>
        <Link
          href="/docs/randevu/raporlar"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Raporlar →
        </Link>
      </div>
    </article>
  );
}
