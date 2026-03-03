"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Home,
  GraduationCap,
  CheckCircle2,
  Link2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { completeSetup } from "./actions";

const MODULE_META: Record<
  string,
  {
    icon: React.ReactNode;
    color: string;
  }
> = {
  randevu: {
    icon: <Scissors className="w-6 h-6 text-indigo-500" />,
    color: "border-indigo-200 bg-indigo-50",
  },
  emlak: {
    icon: <Home className="w-6 h-6 text-emerald-500" />,
    color: "border-emerald-200 bg-emerald-50",
  },
  ders: {
    icon: <GraduationCap className="w-6 h-6 text-amber-500" />,
    color: "border-amber-200 bg-amber-50",
  },
};

interface Module {
  id: string;
  key: string;
  name: string;
  description: string | null;
}

export default function SetupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [slug, setSlug] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modülleri DB'den yükle
  useEffect(() => {
    async function loadModules() {
      setIsLoading(true);
      const res = await fetch("/api/modules");
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
      setIsLoading(false);
    }
    loadModules();
  }, []);

  // İşletme adından otomatik slug öner
  useEffect(() => {
    if (session?.user?.name && !slug) {
      const autoSlug = session.user.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .substring(0, 40);
      setSlug(autoSlug);
      setSlugPreview(autoSlug);
    }
  }, [session]);

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setSlug(clean);
    setSlugPreview(clean);
  };

  const toggleModule = (key: string) => {
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModules.length === 0) {
      setError("Lütfen en az bir modül seçin.");
      return;
    }
    if (!slug || slug.length < 2) {
      setError("Lütfen geçerli bir URL adresi girin.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("slug", slug);
    selectedModules.forEach((m) => formData.append("modules", m));

    const result = await completeSetup(formData);

    if (!result.success) {
      setIsSubmitting(false);
      setError(result.error || "Bir hata oluştu.");
      return;
    }

    // Session'ı güncelle - setupCompleted: true, tenantSlug
    await update({ setupCompleted: true, tenantSlug: result.tenantSlug });

    // Uygulamalar sayfasına yönlendir
    router.push(`/${result.tenantSlug}/app`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
        {/* Başlık */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Hesabınız Başarıyla Oluşturuldu!
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Sistemi sizin için özelleştirelim. İhtiyaç duyduğunuz modülleri
            seçin ve işletmenizin URL adresini belirleyin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Modül Seçimi */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Kullanmak istediğiniz modülleri seçin
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Birden fazla seçebilirsiniz. Bu seçimi daha sonra değiştirebilirsiniz.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {modules.map((m) => {
                  const meta = MODULE_META[m.key];
                  const isSelected = selectedModules.includes(m.key);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleModule(m.key)}
                      className={`relative flex flex-col h-full bg-white border-2 rounded-xl p-6 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-100"
                          : "border-slate-100 hover:border-blue-200"
                      }`}
                    >
                      {/* Seçim işareti */}
                      <div
                        className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-200"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {meta && (
                        <div
                          className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-4 ${meta.color}`}
                        >
                          {meta.icon}
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {m.name}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {m.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Slug / URL Adresi */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              İşletme URL Adresiniz
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Müşterileriniz bu adres üzerinden randevu alabilecek. Sadece küçük
              harf, rakam ve tire (-) kullanın.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
              <Link2 className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-slate-400 text-sm shrink-0">
                multiapp.com/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="isletme-adi"
                className="flex-1 bg-transparent text-slate-900 font-medium text-sm focus:outline-none placeholder:text-slate-300"
                required
                minLength={2}
                maxLength={50}
              />
            </div>
            {slugPreview && (
              <p className="mt-2 text-xs text-slate-400">
                Ön izleme:{" "}
                <span className="text-blue-600 font-medium">
                  multiapp.com/{slugPreview}
                </span>
              </p>
            )}
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || isLoading || selectedModules.length === 0}
              className="bg-slate-900 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  Kurulumu Tamamla ve Panele Geç
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

