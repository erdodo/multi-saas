import { auth } from "@/auth";
import { getDashboardStats } from "@/modules/randevu/actions/appointment.actions";
import Link from "next/link";
import { format, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from "@/modules/randevu/utils/constants";

export default async function RandevuDashboardPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const { tenantSlug } = await params;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-gray-500 text-sm">
          {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Bugünkü Randevu" value={stats?.today.total ?? "—"} sub={`${stats?.today.confirmed ?? 0} onaylı`} color="blue" />
        <StatCard icon="⏳" label="Bekleyen" value={stats?.today.pending ?? "—"} sub="Yanıt bekliyor" color="yellow" />
        <StatCard icon="📊" label="Bu Hafta" value={stats?.week.total ?? "—"} sub="Onaylı randevu" color="purple" />
        <StatCard icon="💰" label="Aylık Gelir"
          value={stats?.month.revenue ? `${Number(stats.month.revenue).toLocaleString("tr-TR")} ₺` : "—"}
          sub="Tamamlanan randevu" color="green" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Yaklaşan Randevular</h2>
          <Link href={`/${tenantSlug}/randevu-panel/dashboard/appointments`} className="text-sm text-brand hover:underline">
            Tümünü gör
          </Link>
        </div>
        {upcomingResult.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📭</div>
            <p>Yaklaşan randevu yok</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingResult.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: appt.service.color ?? "#3b82f6" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {appt.guestName ?? "Kayıtlı Müşteri"}{" "}
                    <span className="text-gray-500 font-normal">— {appt.service.name}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {appt.startAt ? format(appt.startAt, "d MMM, HH:mm", { locale: tr }) : "—"} · {appt.staff.name}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPOINTMENT_STATUS_COLORS[appt.status]}`}>
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

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub: string;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colors = {
    blue: "bg-brand-light", green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600", purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colors[color]} text-xl mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
