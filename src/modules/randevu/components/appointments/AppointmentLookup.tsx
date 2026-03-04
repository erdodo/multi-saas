"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Search } from "lucide-react";
import { getAppointmentsByPhone } from "@/modules/randevu/actions/appointment.actions";
import PhoneMaskInput from "@/modules/randevu/components/booking/PhoneMaskInput";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Onay Bekliyor",
    className: "bg-yellow-100 text-yellow-800",
  },
  CONFIRMED: { label: "Onaylandı", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "İptal", className: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Tamamlandı", className: "bg-blue-100 text-blue-800" },
  NO_SHOW: { label: "Gelişmedi", className: "bg-gray-100 text-gray-700" },
  RESCHEDULED: {
    label: "Yeniden Planlı",
    className: "bg-purple-100 text-purple-800",
  },
};

interface Appointment {
  id: string;
  status: string;
  startAt: string | Date | null;
  guestName: string | null;
  service: { name: string; color: string | null };
  staff: { name: string };
}

interface Props {
  tenantSlug: string;
}

export default function AppointmentLookup({ tenantSlug }: Props) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointmentsByPhone(phone, tenantSlug);
      if (result.success && result.data) {
        setAppointments(result.data as Appointment[]);
      } else {
        setError(result.error ?? "Randevular alınamadı");
        setAppointments([]);
      }
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <PhoneMaskInput
          value={phone}
          onChange={setPhone}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !phone.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          {loading ? "Aranıyor..." : "Sorgula"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {searched && appointments.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">
            Bu telefon numarasına ait randevu bulunamadı.
          </p>
        </div>
      )}

      {appointments.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {appointments.length} randevu bulundu
          </p>
          {appointments.map((appt) => {
            const st = STATUS_LABELS[appt.status] ?? STATUS_LABELS["PENDING"];
            const startAt = appt.startAt ? new Date(appt.startAt) : null;
            return (
              <a
                key={appt.id}
                href={`/${tenantSlug}/randevu-panel/book/${appt.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                      style={{ background: appt.service.color ?? "#3b82f6" }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {appt.service.name}
                      </p>
                      <p className="text-xs text-gray-500">{appt.staff.name}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${st.className}`}
                  >
                    {st.label}
                  </span>
                </div>
                {startAt && (
                  <p className="text-xs text-gray-400 mt-2 ml-6">
                    📅{" "}
                    {format(startAt, "d MMMM yyyy EEEE, HH:mm", { locale: tr })}
                  </p>
                )}
                <p className="text-xs text-gray-300 mt-1 ml-6 font-mono">
                  #{appt.id.slice(0, 8).toUpperCase()}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
