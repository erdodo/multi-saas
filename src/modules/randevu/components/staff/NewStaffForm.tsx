"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, PlusCircle, X, Coffee } from "lucide-react";
import { createStaff } from "@/modules/randevu/actions/staff.actions";
import { createTimeOff } from "@/modules/randevu/actions/staff.actions";
import { createStaffBreak } from "@/modules/randevu/actions/staff.actions";
import QuickServiceDialog from "@/modules/randevu/components/services/QuickServiceDialog";

interface Service {
  id: string;
  name: string;
}
interface Props {
  services: Service[];
  tenantId: string;
  tenantSlug: string;
}

const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];
const DAY_OPTS = DAYS.map((d, i) => ({ label: d, value: i + 1 }));

interface PendingTimeOff {
  startAt: string;
  endAt: string;
  reason: string;
}
interface PendingBreak {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label: string;
}

export default function NewStaffForm({
  services: initialServices,
  tenantId,
  tenantSlug,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceError, setServiceError] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    color: "#3b82f6",
  });
  const [availability, setAvailability] = useState(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i + 1,
      isActive: i < 5,
      startTime: "09:00",
      endTime: "18:00",
    })),
  );

  // İzin / TimeOff
  const [timeOffs, setTimeOffs] = useState<PendingTimeOff[]>([]);
  const [newTimeOff, setNewTimeOff] = useState<PendingTimeOff>({
    startAt: "",
    endAt: "",
    reason: "",
  });

  // Molalar
  const [breaks, setBreaks] = useState<PendingBreak[]>([]);
  const [newBreak, setNewBreak] = useState<PendingBreak>({
    dayOfWeek: 1,
    startTime: "12:00",
    endTime: "13:00",
    label: "Öğle Arası",
  });

  const toggleService = (id: string) =>
    setSelectedServices((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const addTimeOff = () => {
    if (!newTimeOff.startAt || !newTimeOff.endAt) {
      toast.error("Tarih aralığı zorunludur");
      return;
    }
    if (newTimeOff.startAt >= newTimeOff.endAt) {
      toast.error("Başlangıç tarihi bitiş tarihinden önce olmalıdır");
      return;
    }
    setTimeOffs((t) => [...t, newTimeOff]);
    setNewTimeOff({ startAt: "", endAt: "", reason: "" });
  };

  const addBreak = () => {
    if (newBreak.startTime >= newBreak.endTime) {
      toast.error("Başlangıç saati bitiş saatinden önce olmalıdır");
      return;
    }
    setBreaks((b) => [...b, newBreak]);
    setNewBreak({
      dayOfWeek: 1,
      startTime: "12:00",
      endTime: "13:00",
      label: "Öğle Arası",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Ad zorunludur");
      return;
    }
    if (selectedServices.length === 0) {
      setServiceError(true);
      toast.error("En az bir hizmet seçilmelidir");
      return;
    }
    setServiceError(false);
    setSaving(true);
    try {
      const result = await createStaff(
        {
          ...form,
          isActive: true,
          serviceIds: selectedServices,
          availability: availability.filter((a) => a.isActive),
        },
        tenantId,
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const staffId = (result.data as { id: string }).id;

      // İzinleri kaydet
      for (const to of timeOffs) {
        await createTimeOff({ staffId, ...to }, tenantId);
      }
      // Molaları kaydet
      for (const brk of breaks) {
        await createStaffBreak({ staffId, ...brk }, tenantId);
      }

      toast.success("Personel eklendi");
      router.push(`/${tenantSlug}/randevu-panel/dashboard/staff`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {showServiceDialog && (
        <QuickServiceDialog
          tenantId={tenantId}
          onClose={() => setShowServiceDialog(false)}
          onCreated={(s) => {
            setServices((prev) => [...prev, s]);
            setSelectedServices((prev) => [...prev, s.id]);
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* Kişisel Bilgiler */}
        <div className="bg-white rounded-(--brand-card-radius) border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-3">
            👤 Kişisel Bilgiler
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm text-gray-700 mb-1">
                Ad Soyad *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm text-gray-700 mb-1">
                Telefon
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-1">
                Biyografi
              </label>
              <textarea
                rows={2}
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Takvim rengi
              </label>
              <input
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
                className="h-10 w-full rounded border border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Hizmetler */}
        <div
          className={`bg-white rounded-(--brand-card-radius) border p-5 space-y-3 ${serviceError ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}
        >
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-semibold text-gray-900">💼 Hizmetler</h2>
            {serviceError && (
              <span className="text-xs text-red-500 font-medium">
                En az bir hizmet seçin
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const selected = selectedServices.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    toggleService(s.id);
                    setServiceError(false);
                  }}
                  style={
                    selected
                      ? {
                          backgroundColor: form.color,
                          color: "#fff",
                          borderColor: form.color,
                        }
                      : undefined
                  }
                  className={`inline-flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5 border font-medium transition-all ${
                    selected
                      ? "shadow-sm"
                      : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  {s.name}
                </button>
              );
            })}
            {/* Hizmet yok veya + ekle butonu */}
            <button
              type="button"
              onClick={() => setShowServiceDialog(true)}
              className="inline-flex items-center gap-1.5 text-sm rounded-[var(--brand-radius,9999px)] px-3 py-1.5 border border-dashed border-slate-300 text-[var(--brand-primary,#2563eb)] hover:bg-slate-50 font-medium transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {services.length === 0 ? "Hizmet tanımla" : "Yeni hizmet"}
            </button>
          </div>
        </div>

        {/* Çalışma Saatleri */}
        <div className="bg-white rounded-(--brand-card-radius) border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 border-b pb-3">
            📅 Çalışma Saatleri
          </h2>
          {availability.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-[140px_1fr] gap-4 items-center"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={a.isActive}
                  onChange={(e) =>
                    setAvailability((av) =>
                      av.map((x, j) =>
                        j === i ? { ...x, isActive: e.target.checked } : x,
                      ),
                    )
                  }
                />
                <span className="text-sm text-gray-700">{DAYS[i]}</span>
              </div>
              {a.isActive ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={a.startTime}
                    onChange={(e) =>
                      setAvailability((av) =>
                        av.map((x, j) =>
                          j === i ? { ...x, startTime: e.target.value } : x,
                        ),
                      )
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="time"
                    value={a.endTime}
                    onChange={(e) =>
                      setAvailability((av) =>
                        av.map((x, j) =>
                          j === i ? { ...x, endTime: e.target.value } : x,
                        ),
                      )
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Kapalı</span>
              )}
            </div>
          ))}
        </div>

        {/* İzin Günleri */}
        <div className="bg-white rounded-(--brand-card-radius) border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 border-b pb-3">
            🏖️ İzin Tanımla
          </h2>
          {timeOffs.length > 0 && (
            <div className="space-y-2 mb-2">
              {timeOffs.map((to, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-orange-800">
                    {to.startAt.slice(0, 10)} → {to.endAt.slice(0, 10)}
                    {to.reason && (
                      <span className="ml-2 text-orange-500">
                        ({to.reason})
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTimeOffs((t) => t.filter((_, j) => j !== i))
                    }
                    className="text-orange-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Başlangıç
              </label>
              <input
                type="datetime-local"
                value={newTimeOff.startAt}
                onChange={(e) =>
                  setNewTimeOff((t) => ({ ...t, startAt: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
              <input
                type="datetime-local"
                value={newTimeOff.endAt}
                onChange={(e) =>
                  setNewTimeOff((t) => ({ ...t, endAt: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">
                Sebep (opsiyonel)
              </label>
              <input
                value={newTimeOff.reason}
                onChange={(e) =>
                  setNewTimeOff((t) => ({ ...t, reason: e.target.value }))
                }
                placeholder="Yıllık izin, hastalık..."
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addTimeOff}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--brand-primary,#2563eb)] hover:opacity-80 font-medium border border-slate-200 rounded-[var(--brand-radius,8px)] px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> İzin Ekle
          </button>
        </div>

        {/* Mola Tanımla */}
        <div className="bg-white rounded-(--brand-card-radius) border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 border-b pb-3">
            <Coffee className="inline w-4 h-4 mr-1" />
            Mola Tanımla
          </h2>
          {breaks.length > 0 && (
            <div className="space-y-2 mb-2">
              {breaks.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-purple-800">
                    {DAY_OPTS.find((d) => d.value === b.dayOfWeek)?.label} —{" "}
                    {b.startTime}–{b.endTime}
                    {b.label && (
                      <span className="ml-2 text-purple-500">({b.label})</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBreaks((br) => br.filter((_, j) => j !== i))
                    }
                    className="text-purple-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Gün</label>
              <select
                value={newBreak.dayOfWeek}
                onChange={(e) =>
                  setNewBreak((b) => ({
                    ...b,
                    dayOfWeek: Number(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              >
                {DAY_OPTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Etiket</label>
              <input
                value={newBreak.label}
                onChange={(e) =>
                  setNewBreak((b) => ({ ...b, label: e.target.value }))
                }
                placeholder="Öğle Arası"
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={newBreak.startTime}
                onChange={(e) =>
                  setNewBreak((b) => ({ ...b, startTime: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Bitiş Saati
              </label>
              <input
                type="time"
                value={newBreak.endTime}
                onChange={(e) =>
                  setNewBreak((b) => ({ ...b, endTime: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addBreak}
            className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Mola Ekle
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-brand rounded-[var(--brand-radius,12px)] py-3 font-medium transition-colors"
        >
          {saving ? "Kaydediliyor..." : "➕ Personel Ekle"}
        </button>
      </form>
    </>
  );
}
