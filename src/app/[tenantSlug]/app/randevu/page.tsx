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
  PENDING: { label: "Beklemede", cls: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: {
    label: "Onaylı",
    cls: "bg-[var(--brand-primary,#3b82f6)] bg-opacity-10 text-[var(--brand-primary,#1d4ed8)]",
  },
  COMPLETED: { label: "Tamamlandı", cls: "bg-green-100 text-green-800" },
  CANCELLED: { label: "İptal", cls: "bg-gray-100 text-gray-600" },
  NO_SHOW: { label: "Gelmedi", cls: "bg-red-100 text-red-800" },
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

  const todayApps = appointments.filter(
    (a) => a.startTime && isToday(a.startTime),
  );
  const weekApps = appointments.filter(
    (a) => a.startTime && isThisWeek(a.startTime, { weekStartsOn: 1 }),
  );
  const revenueTotal = appointments
    .filter((a) => a.status === "COMPLETED")
    .reduce((sum, a) => sum + Number(a.service.price), 0);
  const recent = appointments.slice(0, 10);

  const bookingUrl = tenant?.slug ? `/${tenant.slug}/randevu-panel/book` : null;
  const panelUrl = `/${tenant?.slug ?? tenantSlug}/randevu-panel/dashboard`;

  const stats = [
    {
      label: "Bugünkü Randevu",
      value: todayApps.length,
      icon: Calendar,
      color: "text-[var(--brand-primary,#2563eb)]",
      bg: "bg-[var(--brand-primary,#3b82f6)] bg-opacity-10",
    },
    {
      label: "Bu Hafta",
      value: weekApps.length,
      icon: TrendingUp,
      color: "text-[var(--brand-primary,#4f46e5)]",
      bg: "bg-[var(--brand-primary,#4f46e5)] bg-opacity-10",
    },
    {
      label: "Aktif Personel",
      value: staffCount,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Toplam Gelir (₺)",
      value: revenueTotal.toLocaleString("tr"),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-(--brand-card-radius) bg-(--brand-primary,#4f46e5) bg-opacity-10 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-(--brand-primary,#4f46e5)" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-(--brand-text)">
              Randevu Modülü
            </h1>
            <p className="text-(--brand-text-muted) text-sm">{tenant?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {bookingUrl && (
            <Link
              href={bookingUrl}
              target="_blank"
              className="flex items-center gap-2 text-sm bg-(--brand-primary,#4f46e5) text-(--brand-text-on-primary,#fff) px-4 py-2 rounded-(--brand-radius) hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              Rezervasyon Sayfası
            </Link>
          )}
          <Link
            href={panelUrl}
            className="flex items-center gap-2 text-sm bg-(--brand-surface) border border-(--brand-border) text-(--brand-text) px-4 py-2 rounded-(--brand-radius) hover:bg-(--brand-surface-2) transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Randevu Paneli →
          </Link>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) p-4"
          >
            <div
              className={`w-9 h-9 rounded-(--brand-radius) ${s.bg} flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-(--brand-text)">{s.value}</p>
            <p className="text-xs text-(--brand-text-muted) mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hızlı Bağlantılar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            href: `${panelUrl}/appointments`,
            label: "Randevular",
            icon: Calendar,
            color: "text-[var(--brand-primary,#2563eb)]",
            bg: "hover:border-[var(--brand-primary,#bfdbfe)]",
          },
          {
            href: `${panelUrl}/staff`,
            label: "Personel",
            icon: Users,
            color: "text-emerald-600",
            bg: "hover:border-emerald-200",
          },
          {
            href: `${panelUrl}/services`,
            label: "Hizmetler",
            icon: Clock,
            color: "text-amber-600",
            bg: "hover:border-amber-200",
          },
          {
            href: `${panelUrl}/reports`,
            label: "Raporlar",
            icon: TrendingUp,
            color: "text-[var(--brand-primary,#4f46e5)]",
            bg: "hover:border-[var(--brand-primary,#c7d2fe)]",
          },
          {
            href: `/${tenantSlug}/app/settings`,
            label: "Ayarlar",
            icon: Settings,
            color: "text-slate-600",
            bg: "hover:border-slate-300",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) p-4 transition-colors ${item.bg} flex items-center gap-3 group`}
          >
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-sm font-medium text-(--brand-text)">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Son Randevular */}
      <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--brand-border)">
          <h2 className="font-semibold text-(--brand-text)">Son Randevular</h2>
          <Link
            href={`${panelUrl}/appointments`}
            className="text-xs text-(--brand-primary,#2563eb) hover:opacity-80"
          >
            Tümünü gör →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-(--brand-surface-2) border-b border-(--brand-border)">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-(--brand-text-muted)">
                Tarih / Saat
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-(--brand-text-muted)">
                Müşteri
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-(--brand-text-muted)">
                Hizmet
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-(--brand-text-muted)">
                Personel
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-(--brand-text-muted)">
                Durum
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--brand-border)">
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Henüz randevu yok</p>
                </td>
              </tr>
            ) : (
              recent.map((a) => {
                const s = STATUS_LABELS[a.status] ?? {
                  label: a.status,
                  cls: "bg-slate-100 text-slate-600",
                };
                return (
                  <tr key={a.id} className="hover:bg-(--brand-surface-2)">
                    <td className="px-5 py-3 text-(--brand-text)">
                      <p className="font-medium">
                        {a.startTime
                          ? format(a.startTime, "d MMM", { locale: tr })
                          : "—"}
                      </p>
                      <p className="text-xs text-(--brand-text-muted)">
                        {a.startTime ? format(a.startTime, "HH:mm") : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-(--brand-text)">
                      {a.customerName}
                    </td>
                    <td className="px-5 py-3 text-(--brand-text-muted)">
                      {a.service.name}
                    </td>
                    <td className="px-5 py-3 text-(--brand-text-muted)">{a.staff.name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 font-medium ${s.cls}`}
                      >
                        {s.label}
                      </span>
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
