import { auth } from "@/auth";
import { getDashboardStats } from "@/modules/randevu/actions/appointment.actions";
import { getReports } from "@/modules/randevu/actions/tenant.actions";
import Link from "next/link";
import { format, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/modules/randevu/utils/constants";
import {
  CalendarDays,
  Clock,
  TrendingUp,
  Banknote,
  ExternalLink,
} from "lucide-react";

const REPORT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-400",
  CONFIRMED: "bg-blue-400",
  CANCELLED: "bg-red-400",
  COMPLETED: "bg-green-400",
  NO_SHOW: "bg-gray-400",
  RESCHEDULED: "bg-purple-400",
};
const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  CANCELLED: "İptal",
  COMPLETED: "Tamamlandı",
  NO_SHOW: "Gelmedi",
  RESCHEDULED: "Ertelendi",
};

export default async function RandevuDashboardPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { slug: true },
  });

  const now = new Date();
  const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [statsResult, upcomingResult, reportsResult] = await Promise.all([
    getDashboardStats(tenantId),
    prisma.appointment.findMany({
      where: {
        tenantId,
        startAt: { gte: startOfDay(new Date()) },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { startAt: "asc" },
      take: 8,
      include: {
        service: { select: { name: true, color: true } },
        staff: { select: { name: true } },
      },
    }),
    getReports(tenantId, monthFrom, monthTo),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const report = reportsResult.success ? reportsResult.data : null;
  const bookingUrl = tenant?.slug ? `/${tenant.slug}/randevu-panel/book` : null;

  const statCards = [
    {
      label: "Bugünkü Randevu",
      value: stats?.today.total ?? "—",
      sub: `${stats?.today.confirmed ?? 0} onaylı`,
      icon: CalendarDays,
      gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
    },
    {
      label: "Bekleyen",
      value: stats?.today.pending ?? "—",
      sub: "Yanıt bekliyor",
      icon: Clock,
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    },
    {
      label: "Bu Hafta",
      value: stats?.week.total ?? "—",
      sub: "Toplam randevu",
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    },
    {
      label: "Aylık Gelir",
      value: stats?.month.revenue
        ? `${Number(stats.month.revenue).toLocaleString("tr-TR")} ₺`
        : "—",
      sub: "Tamamlanan",
      icon: Banknote,
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-(--brand-text)">Genel Bakış</h1>
          <p className="text-(--brand-text-muted) text-sm">
            {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
          </p>
        </div>
        {bookingUrl && (
          <Link
            href={bookingUrl}
            target="_blank"
            className="flex items-center gap-2 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Rezervasyon Sayfası
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: s.gradient }}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-(--brand-text)">{s.value}</p>
            <p className="text-sm font-semibold text-(--brand-text) mt-0.5">
              {s.label}
            </p>
            <p className="text-xs text-(--brand-text-muted) mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--brand-border)">
          <h2 className="font-bold text-(--brand-text)">Yaklaşan Randevular</h2>
          <Link
            href={`/${tenantSlug}/randevu-panel/dashboard/appointments`}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Tümünü gör →
          </Link>
        </div>
        {upcomingResult.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <div className="w-14 h-14 rounded-(--brand-radius) bg-(--brand-surface-2) flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-medium text-(--brand-text-muted)">Yaklaşan randevu yok</p>
            <p className="text-xs mt-1">
              Bugün için planlanmış randevu bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-(--brand-border)">
            {upcomingResult.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-(--brand-surface-2) transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: appt.service.color ?? "#10b981" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-(--brand-text) truncate">
                    {appt.guestName ?? "Kayıtlı Müşteri"}{" "}
                    <span className="text-(--brand-text-muted) font-normal">
                      — {appt.service.name}
                    </span>
                  </p>
                  <p className="text-xs text-(--brand-text-muted) mt-0.5">
                    {appt.startAt
                      ? format(appt.startAt, "d MMM, HH:mm", { locale: tr })
                      : "—"}{" "}
                    · {appt.staff.name}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${APPOINTMENT_STATUS_COLORS[appt.status]}`}
                >
                  {APPOINTMENT_STATUS_LABELS[appt.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bu Ay Raporlar ── */}
      {report && (() => {
        const totalAppts = report.statusBreakdown.reduce((s, r) => s + r.count, 0);
        const noShowRate = totalAppts > 0
          ? Math.round((report.noShowCount / totalAppts) * 100)
          : 0;
        return (
          <div className="space-y-4">
            <h2 className="font-bold text-(--brand-text)">Bu Ay Özeti</h2>

            {/* Mini stat row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Toplam Randevu", value: totalAppts, color: "text-slate-900" },
                { label: "Tamamlanan Gelir", value: `${report.totalRevenue.toLocaleString("tr-TR")} ₺`, color: "text-green-700" },
                { label: "No-show Sayısı", value: report.noShowCount, color: "text-red-600" },
                { label: "No-show Oranı", value: `%${noShowRate}`, color: "text-orange-600" },
              ].map((s) => (
                <div key={s.label} className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) p-4 shadow-sm">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-(--brand-text-muted) mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Durum dağılımı */}
              <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) shadow-sm p-5">
                <h3 className="font-semibold text-(--brand-text) mb-4">Durum Dağılımı</h3>
                <div className="space-y-3">
                  {report.statusBreakdown.map((s) => {
                    const pct = totalAppts > 0 ? Math.round((s.count / totalAppts) * 100) : 0;
                    return (
                      <div key={s.status}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-(--brand-text-muted)">{REPORT_STATUS_LABELS[s.status] ?? s.status}</span>
                          <span className="text-(--brand-text-muted)">{s.count} (%{pct})</span>
                        </div>
                        <div className="h-1.5 bg-(--brand-surface-2) rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${REPORT_STATUS_COLORS[s.status] ?? "bg-slate-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hizmet dağılımı */}
              <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) shadow-sm p-5">
                <h3 className="font-semibold text-(--brand-text) mb-4">Hizmet Dağılımı</h3>
                {report.byService.length === 0 ? (
                  <p className="text-sm text-slate-400">Veri yok</p>
                ) : (
                  <div className="space-y-2">
                    {report.byService.sort((a, b) => b.count - a.count).map((s) => (
                      <div key={s.serviceId} className="flex justify-between text-sm">
                        <span className="text-(--brand-text-muted) truncate">{s.serviceName}</span>
                        <span className="font-medium text-(--brand-text) ml-2 shrink-0">{s.count} randevu</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Personel performansı */}
              <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) shadow-sm p-5">
                <h3 className="font-semibold text-(--brand-text) mb-4">Personel Performansı</h3>
                {report.byStaff.length === 0 ? (
                  <p className="text-sm text-slate-400">Veri yok</p>
                ) : (
                  <div className="space-y-2">
                    {report.byStaff.sort((a, b) => b.count - a.count).map((s) => (
                      <div key={s.staffId} className="flex justify-between text-sm">
                        <span className="text-(--brand-text-muted) truncate">{s.staffName}</span>
                        <span className="font-medium text-(--brand-text) ml-2 shrink-0">{s.count} randevu</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
