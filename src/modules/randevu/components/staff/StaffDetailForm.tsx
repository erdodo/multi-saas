"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setAvailabilityRules, createTimeOff } from "@/modules/randevu/actions/staff.actions";
import { format } from "date-fns";

interface Service { id: string; name: string }
interface AvailabilityRule { id: string; dayOfWeek: number; startTime: string; endTime: string }
interface TimeOff { id: string; startAt: Date; endAt: Date; reason: string | null }
interface Staff {
  id: string;
  name: string;
  color: string | null;
  bio: string | null;
  staffServices: { service: Service }[];
  availabilityRules: AvailabilityRule[];
  timeOffs: TimeOff[];
}

interface Props { staff: Staff; services: Service[]; tenantId: string }

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default function StaffDetailForm({ staff, services, tenantId }: Props) {
  const [saving, setSaving] = useState(false);
  const existingRulesMap = Object.fromEntries(staff.availabilityRules.map((r) => [r.dayOfWeek, r]));
  const [availability, setAvailability] = useState(
    Array.from({ length: 7 }, (_, i) => {
      const ex = existingRulesMap[i + 1];
      return { dayOfWeek: i + 1, isActive: !!ex, startTime: ex?.startTime ?? "09:00", endTime: ex?.endTime ?? "18:00" };
    })
  );
  const [timeOffForm, setTimeOffForm] = useState({ startAt: "", endAt: "", reason: "" });
  const [addingTimeOff, setAddingTimeOff] = useState(false);
  const [timeOffs, setTimeOffs] = useState(staff.timeOffs);

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      const result = await setAvailabilityRules({ staffId: staff.id, rules: availability.filter((a) => a.isActive) }, tenantId);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Çalışma saatleri güncellendi");
    } finally { setSaving(false); }
  };

  const handleAddTimeOff = async () => {
    if (!timeOffForm.startAt || !timeOffForm.endAt) return;
    setAddingTimeOff(true);
    try {
      const result = await createTimeOff({ staffId: staff.id, ...timeOffForm }, tenantId);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("İzin günü eklendi");
      setTimeOffs((t) => [...t, result.data!]);
      setTimeOffForm({ startAt: "", endAt: "", reason: "" });
    } finally { setAddingTimeOff(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-(--brand-card-radius) border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: staff.color ?? "#3b82f6" }}>
            {staff.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <p className="font-semibold text-gray-900">{staff.name}</p>
        </div>
        {staff.bio && <p className="mt-3 text-sm text-gray-600">{staff.bio}</p>}
        <div className="mt-3 flex flex-wrap gap-1">
          {staff.staffServices.map(({ service }) => (
            <span key={service.id} className="text-xs badge-brand rounded-full px-2 py-0.5">{service.name}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-(--brand-card-radius) border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 border-b pb-3">📅 Çalışma Saatleri</h2>
        {availability.map((a, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr] gap-4 items-center">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={a.isActive}
                onChange={(e) => setAvailability((av) => av.map((x, j) => j === i ? { ...x, isActive: e.target.checked } : x))} />
              <span className="text-sm text-gray-700">{DAYS[i]}</span>
            </div>
            {a.isActive ? (
              <div className="flex items-center gap-2">
                <input type="time" value={a.startTime}
                  onChange={(e) => setAvailability((av) => av.map((x, j) => j === i ? { ...x, startTime: e.target.value } : x))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm" />
                <span className="text-gray-400">—</span>
                <input type="time" value={a.endTime}
                  onChange={(e) => setAvailability((av) => av.map((x, j) => j === i ? { ...x, endTime: e.target.value } : x))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm" />
              </div>
            ) : <span className="text-sm text-gray-400 italic">Kapalı</span>}
          </div>
        ))}
        <button onClick={handleSaveAvailability} disabled={saving}
          className="mt-2 w-full btn-brand rounded-lg py-2 text-sm font-medium transition-colors">
          {saving ? "Kaydediliyor..." : "💾 Saatleri Kaydet"}
        </button>
      </div>

      <div className="bg-white rounded-(--brand-card-radius) border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 border-b pb-3">🏖️ İzin Günleri</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Başlangıç</label>
            <input type="datetime-local" value={timeOffForm.startAt}
              onChange={(e) => setTimeOffForm((f) => ({ ...f, startAt: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
            <input type="datetime-local" value={timeOffForm.endAt}
              onChange={(e) => setTimeOffForm((f) => ({ ...f, endAt: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Sebep (opsiyonel)</label>
            <input value={timeOffForm.reason}
              onChange={(e) => setTimeOffForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="ör: Yıllık izin" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          </div>
        </div>
        <button onClick={handleAddTimeOff} disabled={addingTimeOff}
          className="btn-brand-outline rounded-lg py-2 px-4 text-sm font-medium transition-colors">
          {addingTimeOff ? "Ekleniyor..." : "+ İzin Ekle"}
        </button>
        <div className="space-y-1 mt-2">
          {timeOffs.length === 0 ? (
            <p className="text-sm text-gray-400">İzin günü yok</p>
          ) : timeOffs.map((t) => (
            <div key={t.id} className="bg-orange-50 rounded-lg px-3 py-2 text-sm text-gray-700">
              <p className="font-medium">
                {format(new Date(t.startAt), "dd.MM.yyyy HH:mm")} — {format(new Date(t.endAt), "dd.MM.yyyy HH:mm")}
              </p>
              {t.reason && <p className="text-xs text-gray-500">{t.reason}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
