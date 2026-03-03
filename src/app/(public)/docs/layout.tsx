import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokümantasyon — MultiSaaS",
  description: "MultiSaaS platformunu nasıl kullanacağınızı adım adım öğrenin.",
};

const NAV = [
  {
    group: "Başlarken",
    items: [
      { href: "/docs", label: "Genel Bakış" },
      { href: "/docs/kayit", label: "Kayıt & Kurulum" },
      { href: "/docs/giris", label: "Giriş Yapma" },
    ],
  },
  {
    group: "Uygulama Paneli",
    items: [
      { href: "/docs/panel", label: "Uygulamalar" },
      { href: "/docs/ayarlar", label: "Ayarlar" },
    ],
  },
  {
    group: "Randevu Modülü",
    items: [
      { href: "/docs/randevu/genel-bakis", label: "Genel Bakış" },
      { href: "/docs/randevu/randevular", label: "Randevular" },
      { href: "/docs/randevu/takvim", label: "Takvim" },
      { href: "/docs/randevu/musteriler", label: "Müşteriler" },
      { href: "/docs/randevu/hizmetler", label: "Hizmetler" },
      { href: "/docs/randevu/personel", label: "Personel" },
      { href: "/docs/randevu/raporlar", label: "Raporlar" },
      { href: "/docs/randevu/panel-ayarlari", label: "Panel Ayarları" },
    ],
  },
  {
    group: "Online Randevu",
    items: [
      {
        href: "/docs/randevu/online-rezervasyon",
        label: "Online Rezervasyon Formu",
      },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-bold text-slate-900 text-sm">MultiSaaS</span>
          </Link>
          <span className="text-slate-300 hidden sm:block">|</span>
          <span className="text-slate-500 text-sm hidden sm:block font-medium">
            Dokümantasyon
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block border-r border-slate-200 bg-white sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="p-4 space-y-6">
            {NAV.map((section) => (
              <div key={section.group}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
                  {section.group}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-6 py-8 sm:px-10 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
