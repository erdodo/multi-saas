import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, isToday, isThisWeek } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  ExternalLink,
  Scissors,
  TrendingUp,
  Settings,
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Beklemede", cls: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Onaylı",    cls: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Tamamlandı",cls: "bg-green-100 text-green-800" },
  CANCELLED: { label: "İptal",     cls: "bg-gray-100 text-gray-600" },
  NO_SHOW:   { label: "Gelmedi",   cls: "bg-red-100 text-red-800" },
};

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function RandevuPage({ params }: Props) {
  const { tenantSlug } = await params;
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  const tenantId = session.user.tenantId;

  const [tenant, appointments, staffCount] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.appointment.findMany({
      where: { tenantId },
      include: { staff: true, service: true },
      orderBy: { startTime: "desc" },
      take: 200,
    }),
    prisma.staff.count({ where: { tenantId, isActive: true } }),
  ]);

  const todayApps = appointments.filter((a) => a.startTime && isToday(a.startTime));
  const weekApps  = appointments.filter((a) => a.startTime && isThisWeek(a.startTime, { weekStartsOn: 1 }));
  const revenueTotal = appointments
    .filter((a) => a.status === "COMPLETED")
    .reduce((sum, a) => sum + a.service.price, 0);
  const recent = appointments.slice(0, 10);

  const bookingUrl = tenant?.slug ? `/${tenant.slug}/randevu-panel/book` : null;
  const panelUrl   = `/${tenant?.slug ?? tenantSlug}/randevu-panel/dashboard`;

  const stats = [
    { label: "Bugünkü Randevu",    value: todayApps.length,              icon: Calendar,     color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Bu Hafta",           value: weekApps.length,               icon: TrendingUp,   color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Aktif Personel",     value: staffCount,                    icon: Users,        color: "text-emerald-600",bg: "bg-emerald-50"},
    { label: "Toplam Gelir (₺)",   value: revenueTotal.toLocaleString("tr"), icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50"  },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Randevu Modülü</h1>
            <p className="text-slate-500 text-sm">{tenant?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {bookingUrl && (
            <Link
              href={bookingUrl}
              target="_blank"
              className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Rezervasyon Sayfası
            </Link>
          )}
          <Link
            href={panelUrl}
            className="flex items-center gap-2 text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Randevu Paneli →
          </Link>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hızlı Bağlantılar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: `${panelUrl}/appointments`, label: "Randevular",  icon: Calendar,  color: "text-blue-600",   bg: "hover:border-blue-200" },
          { href: `${panelUrl}/staff`,        label: "Personel",    icon: Users,     color: "text-emerald-600",bg: "hover:border-emerald-200" },
          { href: `${panelUrl}/services`,     label: "Hizmetler",   icon: Clock,     color: "text-amber-600",  bg: "hover:border-amber-200" },
          { href: `${panelUrl}/reports`,      label: "Raporlar",    icon: TrendingUp,color: "text-indigo-600", bg: "hover:border-indigo-200" },
          { href: `/${tenantSlug}/app/settings`,           label: "Ayarlar",     icon: Settings,  color: "text-slate-600",  bg: "hover:border-slate-300" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bg-white rounded-xl border border-slate-200 p-4 transition-colors ${item.bg} flex items-center gap-3 group`}
          >
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Son Randevular */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Son Randevular</h2>
          <Link href={`${panelUrl}/appointments`} className="text-xs text-blue-600 hover:underline">
            Tümünü gör →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Tarih / Saat</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Müşteri</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Hizmet</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Personel</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Henüz randevu yok</p>
                </td>
              </tr>
            ) : (
              recent.map((a) => {
                const s = STATUS_LABELS[a.status] ?? { label: a.status, cls: "bg-slate-100 text-slate-600" };
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-700">
                      <p className="font-medium">{a.startTime ? format(a.startTime, "d MMM", { locale: tr }) : "—"}</p>
                      <p className="text-xs text-slate-400">{a.startTime ? format(a.startTime, "HH:mm") : ""}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{a.customerName}</td>
                    <td className="px-5 py-3 text-slate-600">{a.service.name}</td>
                    <td className="px-5 py-3 text-slate-600">{a.staff.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${s.cls}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
