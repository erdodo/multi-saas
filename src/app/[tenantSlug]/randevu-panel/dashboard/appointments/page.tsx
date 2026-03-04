import { auth } from "@/auth";
import { getAppointments } from "@/modules/randevu/actions/appointment.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from "@/modules/randevu/utils/constants";
import AppointmentActions from "@/modules/randevu/components/appointments/AppointmentActions";

interface SearchParams {
  page?: string; status?: string; staffId?: string;
  dateFrom?: string; dateTo?: string; search?: string;
}

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const sp = await searchParams;

  const result = await getAppointments(tenantId, {
    page: Number(sp.page ?? 1), pageSize: 20,
    status: sp.status as never, staffId: sp.staffId,
    dateFrom: sp.dateFrom, dateTo: sp.dateTo, search: sp.search,
    sortBy: "startAt", sortOrder: "asc",
  });

  const { appointments = [], pagination } = result.success
    ? result.data!
    : { appointments: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 1 } };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-(--brand-text)">Randevular</h1>
        <p className="text-(--brand-text-muted) text-sm">{pagination?.total ?? 0} randevu bulundu</p>
      </div>

      <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) p-4 flex flex-wrap gap-3">
        <form className="flex flex-wrap gap-3 w-full">
          <input name="search" defaultValue={sp.search} type="search" placeholder="Müşteri ara..."
            className="border border-(--brand-border) bg-(--brand-surface) text-(--brand-text) rounded-lg px-3 py-2 text-sm ring-brand min-w-[200px]" />
          <select name="status" defaultValue={sp.status ?? ""}
            className="border border-(--brand-border) bg-(--brand-surface) text-(--brand-text) rounded-lg px-3 py-2 text-sm ring-brand">
            <option value="">Tüm Durumlar</option>
            {Object.entries(APPOINTMENT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input name="dateFrom" type="date" defaultValue={sp.dateFrom}
            className="border border-(--brand-border) bg-(--brand-surface) text-(--brand-text) rounded-lg px-3 py-2 text-sm ring-brand" />
          <input name="dateTo" type="date" defaultValue={sp.dateTo}
            className="border border-(--brand-border) bg-(--brand-surface) text-(--brand-text) rounded-lg px-3 py-2 text-sm ring-brand" />
          <button type="submit" className="btn-brand transition-colors">Filtrele</button>
        </form>
      </div>

      <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-(--brand-surface-2) border-b border-(--brand-border)">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Müşteri</th>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Hizmet</th>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Uzman</th>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Tarih &amp; Saat</th>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-(--brand-text-muted)">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--brand-border)">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-(--brand-text-muted)">
                  <div className="text-3xl mb-2">📦</div>
                  <p>Randevu bulunamadı</p>
                </td>
              </tr>
            ) : appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-(--brand-surface-2)">
                <td className="px-4 py-3">
                  <p className="font-medium text-(--brand-text)">
                    {appt.guestName ?? `${appt.customer?.firstName} ${appt.customer?.lastName}`}
                  </p>
                  {(appt.guestPhone ?? appt.customer?.phone) && (
                    <p className="text-xs text-(--brand-text-muted)">{appt.guestPhone ?? appt.customer?.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: appt.service.color ?? "#3b82f6" }} />
                    {appt.service.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-(--brand-text)">{appt.staff.name}</td>
                <td className="px-4 py-3 text-(--brand-text) whitespace-nowrap">
                  {appt.startAt ? format(new Date(appt.startAt), "d MMM yyyy, HH:mm", { locale: tr }) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${APPOINTMENT_STATUS_COLORS[appt.status]}`}>
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <AppointmentActions appointmentId={appt.id} status={appt.status} tenantId={tenantId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-(--brand-border)">
            <p className="text-sm text-(--brand-text-muted)">Sayfa {pagination.page} / {pagination.totalPages}</p>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <a href={`?page=${pagination.page - 1}`} className="text-sm text-brand hover:underline">← Önceki</a>
              )}
              {pagination.page < pagination.totalPages && (
                <a href={`?page=${pagination.page + 1}`} className="text-sm text-brand hover:underline">Sonraki →</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
