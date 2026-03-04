"use client";

import Link from "next/link";
import { ArrowLeft, User, Lock } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });

      // NextAuth v4 uyumluluk: result.error kontrolü
      if (result?.error) {
        setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
        return;
      }

      // Başarılı giriş
      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      // NextAuth v5 beta: hataları exception olarak fırlatır
      const message =
        err instanceof Error ? err.message : String(err);

      if (
        message.includes("CredentialsSignin") ||
        message.includes("credentials") ||
        message.includes("Credentials")
      ) {
        setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      } else {
        setError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Ana Sayfaya Dön
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Giriş Yap</h1>
          <p className="text-slate-500 text-sm">
            İşletmenizi yönetmeye kaldığınız yerden devam edin.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="email">
              E-posta
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="ornek@sirketiniz.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-900" htmlFor="password">
                Şifre
              </label>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                Şifremi Unuttum
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-6 shadow-sm shadow-blue-200 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}

