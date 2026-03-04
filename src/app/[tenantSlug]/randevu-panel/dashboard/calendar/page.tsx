import { auth } from "@/auth";
import { getAppointments } from "@/modules/randevu/actions/appointment.actions";
import CalendarView from "@/modules/randevu/components/calendar/CalendarView";

export default async function CalendarPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const result = await getAppointments(tenantId, {
    page: 1,
    pageSize: 500,
    sortBy: "startAt",
    sortOrder: "asc",
  });
  const appointments = result.success ? result.data!.appointments : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-(--brand-text)">Takvim</h1>
        <p className="text-(--brand-text-muted) text-sm">Tüm randevuların aylık görünümü</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Beklemede", color: "bg-yellow-400" },
          { label: "Onaylı", color: "bg-[var(--brand-primary,#3b82f6)]" },
          { label: "Tamamlandı", color: "bg-green-500" },
          { label: "İptal", color: "bg-gray-300" },
          { label: "Gelmedi", color: "bg-red-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-1.5 text-xs text-(--brand-text-muted)"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            {s.label}
          </div>
        ))}
      </div>

      <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) p-4">
        <CalendarView appointments={appointments} />
      </div>
    </div>
  );
}
