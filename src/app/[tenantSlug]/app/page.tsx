import Link from "next/link";
import {
  Scissors,
  Home,
  GraduationCap,
  ArrowRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const MODULE_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    gradient: string;
    badge: string;
    emoji: string;
  }
> = {
  randevu: {
    icon: <Scissors className="w-7 h-7 text-white" />,
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    badge: "Aktif",
    emoji: "✂️",
  },
  emlak: {
    icon: <Home className="w-7 h-7 text-white" />,
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    badge: "Aktif",
    emoji: "🏠",
  },
  ders: {
    icon: <GraduationCap className="w-7 h-7 text-white" />,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    badge: "Aktif",
    emoji: "🎓",
  },
};

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function AppPage({ params }: Props) {
  const { tenantSlug } = await params;
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantModules = await prisma.tenantModule.findMany({
    where: { tenantId: session.user.tenantId, isActive: true },
    include: { module: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles
            className="w-5 h-5"
            style={{ color: "var(--brand-primary, #6366f1)" }}
          />
          <h1 className="text-2xl font-bold text-slate-900">Uygulamalarım</h1>
        </div>
        <p className="text-slate-500 text-sm ml-7">
          Sahip olduğunuz tüm modüllere buradan erişebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tenantModules.map(({ module: m }) => {
          const cfg = MODULE_CONFIG[m.key];

          return (
            <Link
              key={m.id}
              href={`/${tenantSlug}/app/${m.key}`}
              className="group relative flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ borderRadius: "var(--brand-radius, 8px)" }}
            >
              {/* Gradient top section */}
              <div
                className="p-6 pb-5"
                style={{
                  background:
                    cfg?.gradient ??
                    "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    {cfg?.icon ?? (
                      <span className="text-2xl">{cfg?.emoji ?? "📦"}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                    {cfg?.badge ?? "Aktif"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{m.name}</h2>
              </div>

              {/* White bottom section */}
              <div className="bg-white px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-slate-500 line-clamp-1">
                  {m.description}
                </p>
                <div className="flex items-center text-sm font-semibold text-indigo-600 ml-3 flex-shrink-0 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}

        {/* Yeni Modül Ekle Kartı */}
        <Link
          href="/setup"
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-8 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300 group min-h-[160px]"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">
            Yeni Modül Ekle
          </h2>
          <p className="text-xs text-slate-400 text-center mt-1.5 max-w-[160px]">
            Daha fazla hizmet için mağazayı ziyaret edin
          </p>
        </Link>
      </div>
    </div>
  );
}
