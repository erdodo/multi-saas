import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Settings,
  Calendar,
  Users,
  BarChart2,
  Scissors,
} from "lucide-react";

const CARDS = [
  {
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    title: "Kayıt & Kurulum",
    desc: "Hesap oluşturun, modül seçin ve URL adresinizi belirleyin.",
    href: "/docs/kayit",
  },
  {
    icon: Settings,
    color: "bg-slate-50 text-slate-600",
    title: "Ayarlar",
    desc: "İşletme bilgileri, marka renkleri, kullanıcı ve şifre.",
    href: "/docs/ayarlar",
  },
  {
    icon: Calendar,
    color: "bg-indigo-50 text-indigo-600",
    title: "Randevu Yönetimi",
    desc: "Randevuları listeleyin, onaylayın veya iptal edin.",
    href: "/docs/randevu/randevular",
  },
  {
    icon: Scissors,
    color: "bg-purple-50 text-purple-600",
    title: "Hizmetler & Personel",
    desc: "Sunduğunuz hizmetleri ve çalışanlarınızı tanımlayın.",
    href: "/docs/randevu/hizmetler",
  },
  {
    icon: Users,
    color: "bg-green-50 text-green-600",
    title: "Müşteriler",
    desc: "Müşteri listesini görüntüleyin ve kayıtlara erişin.",
    href: "/docs/randevu/musteriler",
  },
  {
    icon: BarChart2,
    color: "bg-amber-50 text-amber-600",
    title: "Raporlar",
    desc: "Gelir, doluluk ve iptal istatistiklerini inceleyin.",
    href: "/docs/randevu/raporlar",
  },
];

export default function DocsIndex() {
  return (
    <div className="max-w-3xl space-y-10">
      {/* Hero */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          Resmi Dokümantasyon
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-3">
          MultiSaaS Dokümantasyon
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          MultiSaaS, işletmenizi kolayca yönetmeniz için randevu, müşteri takibi
          ve raporlama araçlarını tek bir platformda sunar. Bu belgede tüm
          sayfaları, butonları ve senaryoları bulabilirsiniz.
        </p>
      </div>

      {/* Quick cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm mb-0.5">
                  {c.title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {c.desc}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors mt-0.5 shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Flow overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 text-lg mb-4">
          Platform Akışı
        </h2>
        <ol className="space-y-3">
          {[
            {
              step: "1",
              label: "Kayıt Ol",
              desc: "İşletme adı, ad soyad, e-posta ve şifre ile hesap oluşturulur.",
              href: "/docs/kayit",
            },
            {
              step: "2",
              label: "Kurulum Sihirbazı",
              desc: "Modül seçilir (Randevu, Emlak, Ders) ve işletme URL adresi belirlenir.",
              href: "/docs/kayit#kurulum",
            },
            {
              step: "3",
              label: "Uygulama Paneli",
              desc: "Seçilen modüllere tek tıkla erişilir.",
              href: "/docs/panel",
            },
            {
              step: "4",
              label: "Randevu Paneli",
              desc: "Hizmet, personel tanımlanır; randevular yönetilir.",
              href: "/docs/randevu/genel-bakis",
            },
            {
              step: "5",
              label: "Online Rezervasyon",
              desc: "Müşteriler doğrudan yönlendirme bağlantısından randevu alır.",
              href: "/docs/randevu/online-rezervasyon",
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </span>
              <div>
                <Link
                  href={item.href}
                  className="font-medium text-slate-900 hover:text-blue-600 transition-colors text-sm"
                >
                  {item.label}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
