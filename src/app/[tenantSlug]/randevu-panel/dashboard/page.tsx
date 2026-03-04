import { auth } from "@/auth";
import { getDashboardStats } from "@/modules/randevu/actions/appointment.actions";
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

  const [statsResult, upcomingResult] = await Promise.all([
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
  ]);

  const stats = statsResult.success ? statsResult.data : null;
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
          <h1 className="text-2xl font-bold text-slate-900">Genel Bakış</h1>
          <p className="text-slate-500 text-sm">
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
            className="bg-white rounded-[var(--brand-radius,16px)] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: s.gradient }}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {s.label}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-[var(--brand-radius,16px)] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-bold text-slate-900">Yaklaşan Randevular</h2>
          <Link
            href={`/${tenantSlug}/randevu-panel/dashboard/appointments`}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Tümünü gör →
          </Link>
        </div>
        {upcomingResult.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <div className="w-14 h-14 rounded-[var(--brand-radius,16px)] bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">Yaklaşan randevu yok</p>
            <p className="text-xs mt-1">
              Bugün için planlanmış randevu bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {upcomingResult.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: appt.service.color ?? "#10b981" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {appt.guestName ?? "Kayıtlı Müşteri"}{" "}
                    <span className="text-slate-400 font-normal">
                      — {appt.service.name}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
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
    </div>
  );
}
