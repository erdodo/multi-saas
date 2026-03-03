import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Takvim — MultiSaaS Docs" };

export default function TakvimPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Randevu Modülü
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Takvim</h1>
        <p className="text-slate-500 leading-relaxed">
          Randevuları takvim görünümünde izleyin. Haftalık veya aylık düzende
          gün/saat bazlı bloklara bakarak güncel yoğunluğu hızlıca
          değerlendirin.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/randevu-panel/dashboard/calendar
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Görünüm</h2>
        <p className="text-sm text-slate-600">
          Takvim, her randevuyu hizmetin rengine göre boyalı bir blok olarak
          gösterir. Blokta müşteri adı, saat ve uzman bilgisi yer alır.
        </p>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/randevu/randevular"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Randevular
        </Link>
        <Link
          href="/docs/randevu/musteriler"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Müşteriler →
        </Link>
      </div>
    </article>
  );
}
