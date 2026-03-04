"use client";

import Link from "next/link";
import { ArrowLeft, User, Lock, Mail, Building } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "./actions";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Kullanıcıyı ve tenant'ı oluştur
    const result = await registerUser(formData);

    if (!result.success) {
      setIsLoading(false);
      toast.error(result.error || "Hesap oluşturulamadı.", {
        description: "Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
      });
      return;
    }

    toast.success("Hesabınız oluşturuldu!", { description: "Oturum açılıyor..." });

    // 2. Otomatik giriş yap
    try {
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.warning("Otomatik giriş yapılamadı.", {
          description: "Lütfen e-posta ve şifrenizle giriş yapın.",
        });
        setIsLoading(false);
        router.push("/login");
        return;
      }
    } catch {
      // NextAuth v5 bazı senaryolarda exception fırlatır
      toast.warning("Hesabınız oluşturuldu. Lütfen giriş yapın.");
      setIsLoading(false);
      router.push("/login");
      return;
    }

    // 3. Setup sayfasına yönlendir
    setIsLoading(false);
    router.push("/setup");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Ana Sayfaya Dön
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Hesap Oluştur
          </h1>
          <p className="text-slate-500 text-sm">
            Ücretsiz kaydolun ve işletmenizi hemen yönetmeye başlayın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              İşletme Adı
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="businessName"
                placeholder="Örn: Yıldız Kuaför"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Adınız Soyadınız
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="fullName"
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="ornek@sirketiniz.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-6 shadow-sm shadow-blue-200 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Kaydediliyor..." : "Kayıt Ol ve Devam Et"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Zaten hesabınız var mı?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
