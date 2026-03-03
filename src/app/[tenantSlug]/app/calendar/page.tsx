import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AppCalendar from "@/components/app/AppCalendar";

const STATUS_LABELS: Record<string, string> = {
  PENDING:   "Beklemede",
  CONFIRMED: "Onaylı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  NO_SHOW:   "Gelmedi",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  const tenantId = session.user.tenantId;

  const appointments = await prisma.appointment.findMany({
    where: { tenantId },
    include: { service: { select: { name: true, color: true } } },
    orderBy: { startTime: "asc" },
    take: 500,
  });

  // Serialise Dates for client component
  const serialised = appointments
    .filter((a) => a.startTime != null)
    .map((a) => ({
      id:           a.id,
      startTime:    a.startTime!.toISOString(),
      customerName: a.customerName ?? "",
      status:       a.status,
      service:      a.service,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Takvim</h1>
        <p className="text-slate-500 text-sm">Tüm randevuların aylık görünümü</p>
      </div>

      {/* Renk göstergesi */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const colors: Record<string, string> = {
            PENDING:   "bg-yellow-400",
            CONFIRMED: "bg-blue-500",
            COMPLETED: "bg-green-500",
            CANCELLED: "bg-slate-300",
            NO_SHOW:   "bg-red-400",
          };
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className={`w-2.5 h-2.5 rounded-full ${colors[key]}`} />
              {label}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <AppCalendar appointments={serialised} />
      </div>
    </div>
  );
}
