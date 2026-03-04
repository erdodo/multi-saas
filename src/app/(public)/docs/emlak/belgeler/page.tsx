import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Belgeler — MultiSaaS Docs" };

export default function BelgelerPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          Emlak Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          Belgeler
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Mülk ve sözleşmelere ait belgeleri (tapu, sigorta poliçesi, kira
          sözleşmesi vb.) kayıt altına alın ve son kullanma tarihlerini takip
          edin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/emlak-panel/dashboard/documents
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Yeni Belge Formu</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 w-40">
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
                {
                  f: "Başlık",
                  d: "Belgeyi tanımlayan isim (min 2 karakter)",
                  z: "✓",
                },
                {
                  f: "Belge Türü",
                  d: "Tapu, Sigorta, Kira Sözleşmesi, Diğer vb.",
                  z: "✓",
                },
                {
                  f: "Bağlı Mülk",
                  d: "Belgenin hangi mülke ait olduğu (opsiyonel)",
                  z: "",
                },
                {
                  f: "Bağlı Sözleşme",
                  d: "Belgenin hangi sözleşmeye ait olduğu (opsiyonel)",
                  z: "",
                },
                {
                  f: "Dosya URL",
                  d: "Belge dosyasının bağlantısı (geçerli URL)",
                  z: "",
                },
                {
                  f: "Son Kullanma Tarihi",
                  d: "Belgenin geçerliliğini yitireceği tarih",
                  z: "",
                },
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
          <strong>Not:</strong> Bir belge hem mülke hem de sözleşmeye
          bağlanabilir veya sadece birini seçebilirsiniz. Her ikisi de boş
          bırakılabilir (genel belge).
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Mülk Fotoğrafları</h2>
        <p className="text-sm text-slate-600">
          Belgeler sayfasından ayrı olarak, <strong>Mülk detay</strong>{" "}
          sayfasında Fotoğraf Ekle seçeneği de bulunur. Fotoğraf alanları:
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
              {[
                { f: "Fotoğraf URL", d: "Görüntünün geçerli bağlantısı" },
                { f: "Açıklama", d: "Kısa açıklama metni (isteğe bağlı)" },
                {
                  f: "Ana Fotoğraf",
                  d: "İşaretlenirse diğer ana fotoğrafların işareti kaldırılır",
                },
                { f: "Sıra", d: "Görüntüleme sırası (0 = ilk)" },
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
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/emlak/mal-sahipleri"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Mal Sahipleri
        </Link>
        <Link
          href="/docs/emlak/abonelikler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Abonelikler →
        </Link>
      </div>
    </article>
  );
}
