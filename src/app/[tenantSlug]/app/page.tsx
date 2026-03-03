import Link from "next/link";
import { Scissors, Home, GraduationCap, ArrowRight, Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const MODULE_STYLES: Record<
  string,
  { icon: React.ReactNode; color: string; iconBg: string }
> = {
  randevu: {
    icon: <Scissors className="w-8 h-8 text-indigo-500" />,
    color: "border-indigo-100 hover:border-indigo-300 bg-white",
    iconBg: "bg-indigo-50",
  },
  emlak: {
    icon: <Home className="w-8 h-8 text-emerald-500" />,
    color: "border-emerald-100 hover:border-emerald-300 bg-white",
    iconBg: "bg-emerald-50",
  },
  ders: {
    icon: <GraduationCap className="w-8 h-8 text-amber-500" />,
    color: "border-amber-100 hover:border-amber-300 bg-white",
    iconBg: "bg-amber-50",
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Uygulamalarım
        </h1>
        <p className="text-slate-500 text-sm">
          Sahip olduğunuz tüm modüllere buradan erişebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenantModules.map(({ module: m }) => {
          const style = MODULE_STYLES[m.key] ?? {
            icon: <Scissors className="w-8 h-8 text-slate-400" />,
            color: "border-slate-100 hover:border-slate-300 bg-white",
            iconBg: "bg-slate-50",
          };

          return (
            <Link
              key={m.id}
              href={`/${tenantSlug}/app/${m.key}`}
              className={`flex flex-col h-full rounded-2xl border ${style.color} p-6 transition-all hover:shadow-lg hover:-translate-y-1 group`}
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${style.iconBg}`}
              >
                {style.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {m.name}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
                {m.description}
              </p>
              <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Modüle Git
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}

        {/* Modül Ekleme Kartı */}
        <div className="flex flex-col items-center justify-center h-full rounded-2xl border border-dashed border-slate-300 p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center mb-4 text-slate-400">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-medium text-slate-700">Yeni Modül Ekle</h2>
          <p className="text-sm text-slate-500 text-center mt-2">
            Daha fazla hizmet için mağazayı ziyaret edin.
          </p>
        </div>
      </div>
    </div>
  );
}
