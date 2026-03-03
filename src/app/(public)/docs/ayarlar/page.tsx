import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayarlar — MultiSaaS Docs",
};

const TABS = [
  {
    id: "isletme",
    label: "İşletme",
    icon: "🏢",
    desc: "İşletme adı ve URL adresi (slug) değiştirme.",
    fields: [
      { name: "İşletme Adı", desc: "Panelde ve müşteri formunda görünen ad" },
      {
        name: "URL Adresi (slug)",
        desc: "sitem.com/{slug} formatındaki özel adresiniz",
      },
    ],
    button: "Kaydet",
  },
  {
    id: "marka",
    label: "Marka",
    icon: "🎨",
    desc: "Site başlığı, logo, favicon, renkler, yazı tipi ve kenar yuvarlama.",
    fields: [
      { name: "Site Başlığı", desc: "Tarayıcı sekmesi ve SEO başlığı" },
      { name: "Logo URL", desc: "PNG/SVG formatında logo bağlantısı" },
      { name: "Favicon URL", desc: "Küçük sekme ikonu, 32×32 px önerilir" },
      { name: "Ana Renk", desc: "Buton ve vurgu rengi (hex kodu)" },
      { name: "İkincil Renk", desc: "Yardımcı aksiyonlar için renk" },
      { name: "Vurgu Rengi", desc: "Badge ve öne çıkan öğeler için" },
      {
        name: "Ana Renk Üstü Metin",
        desc: "Ana renk arka planında okunacak metin rengi",
      },
      { name: "Yazı Tipi", desc: "Inter, Poppins, Roboto veya System Default" },
      {
        name: "Kenar Yuvarlama",
        desc: "Köşeli, Az Yuvarlak, Orta, Yuvarlak, Tam",
      },
      { name: "Karanlık Mod", desc: "Açık/kapalı toggle" },
    ],
    button: "Marka Ayarlarını Kaydet",
  },
  {
    id: "kullanici",
    label: "Kullanıcı",
    icon: "👤",
    desc: "Hesap sahibinin adı ve e-posta adresi güncelleme.",
    fields: [
      { name: "Ad Soyad", desc: "Profil ve panelde görünen isim" },
      { name: "E-posta", desc: "Giriş için kullanılan e-posta" },
    ],
    button: "Kaydet",
  },
  {
    id: "sifre",
    label: "Şifre",
    icon: "🔒",
    desc: "Mevcut şifre doğrulayarak yeni şifre belirleme.",
    fields: [
      { name: "Mevcut Şifre", desc: "Doğrulama için mevcut şifre" },
      { name: "Yeni Şifre", desc: "Yeni şifre (min 6 karakter)" },
      {
        name: "Yeni Şifre (Tekrar)",
        desc: "Yeni şifre tekrarı — eşleşmezse hata gösterilir",
      },
    ],
    button: "Şifreyi Değiştir",
  },
];

export default function AyarlarPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
          Uygulama Paneli
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Ayarlar</h1>
        <p className="text-slate-500 leading-relaxed">
          İşletme bilgilerini, marka kimliğini ve hesap güvenliğini bu sayfadan
          yönetirsiniz. Sayfa 4 sekmeye ayrılmıştır.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          URL: /{"{tenantSlug}"}/app/settings
        </p>
      </div>

      <div className="space-y-5">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            id={tab.id}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
              <span className="text-2xl">{tab.icon}</span>
              <div>
                <h2 className="font-bold text-slate-900">
                  {tab.label} Sekmesi
                </h2>
                <p className="text-xs text-slate-500">{tab.desc}</p>
              </div>
            </div>
            <div className="space-y-2">
              {tab.fields.map((f) => (
                <div key={f.name} className="flex items-start gap-2 text-sm">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900">{f.name}:</strong>{" "}
                    <span className="text-slate-500">{f.desc}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                Buton: {tab.button}
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Canlı Önizleme</h2>
        <p className="text-sm text-slate-600">
          <strong>Marka</strong> sekmesinde renk, font ve kenar yuvarlama
          değişikliklerini kaydetmeden önce sağ paneldeki{" "}
          <em>Canlı Önizleme</em> alanında anlık olarak görürsünüz.
        </p>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Link
          href="/docs/panel"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Uygulama Paneli
        </Link>
        <Link
          href="/docs/randevu/genel-bakis"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Sonraki: Randevu Genel Bakış →
        </Link>
      </div>
    </article>
  );
}
