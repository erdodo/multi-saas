import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            MultiSaaS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Kayıt Ol
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Tüm İşletmeniz Tek Platformda
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900">
            İşletmenizi Kolayca{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Yönetin
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Berber, öğretmen, diyetisyen veya emlakçı olun; ihtiyacınız olan tüm
            yönetim araçları, randevu ve müşteri takip sistemleri elinizin
            altında.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              Hemen Başla
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
            {[
              {
                title: "Randevu Sistemi",
                desc: "Müşterileriniz online randevu alsın, siz sadece onaylayın.",
              },
              {
                title: "Müşteri Yönetimi",
                desc: "Tüm müşteri verilerinizi güvenle saklayın ve analiz edin.",
              },
              {
                title: "Çoklu Platform",
                desc: "Hem webden hem de mobil uygulama olarak erişin.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <h3 className="font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
