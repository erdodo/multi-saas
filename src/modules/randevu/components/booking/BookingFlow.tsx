"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { createAppointment, getAvailableSlots } from "@/modules/randevu/actions/appointment.actions";
import type { TimeSlot } from "@/modules/randevu/utils/time-slots";

type Step = "SERVICE" | "STAFF" | "DATETIME" | "INFO" | "SUCCESS";

interface BookingService {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  currency: string;
  color: string | null;
}

interface BookingStaff {
  id: string;
  name: string;
  bio: string | null;
  color: string;
  serviceIds: string[];
  availableDays: number[];
}

interface BookingSettings {
  bookingWindowDays: number;
  slotIntervalMinutes: number;
  autoConfirm: boolean;
}

interface Props {
  tenantId: string;
  tenantSlug: string;
  services: BookingService[];
  staffList: BookingStaff[];
  settings: BookingSettings;
}

interface BookingState {
  serviceId?: string;
  staffId?: string;
  date?: string;
  time?: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  notes: string;
}

const STEP_LABELS: Record<Step, string> = {
  SERVICE: "Hizmet",
  STAFF: "Uzman",
  DATETIME: "Tarih & Saat",
  INFO: "Bilgiler",
  SUCCESS: "Tamamlandı",
};

export default function BookingFlow({ tenantId, services, staffList, settings }: Props) {
  const [step, setStep] = useState<Step>("SERVICE");
  const [state, setState] = useState<BookingState>({
    guestName: "", guestPhone: "", guestEmail: "", notes: "",
  });
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === state.serviceId);
  const selectedStaff = staffList.find((s) => s.id === state.staffId);
  const filteredStaff = staffList.filter((s) => s.serviceIds.includes(state.serviceId ?? ""));

  const today = new Date();
  const minDate = format(today, "yyyy-MM-dd");
  const maxDate = format(addDays(today, settings.bookingWindowDays), "yyyy-MM-dd");

  const handleServiceSelect = (serviceId: string) => {
    setState((s) => ({ ...s, serviceId, staffId: undefined, date: undefined, time: undefined }));
    setStep("STAFF");
  };

  const handleStaffSelect = (staffId: string) => {
    setState((s) => ({ ...s, staffId, date: undefined, time: undefined }));
    setStep("DATETIME");
  };

  const handleDateChange = async (dateStr: string) => {
    if (!state.staffId || !state.serviceId) return;
    setState((s) => ({ ...s, date: dateStr, time: undefined }));
    setSlots([]);
    setLoadingSlots(true);
    try {
      const result = await getAvailableSlots(state.staffId, dateStr, state.serviceId, tenantId);
      if (result.success && result.data) {
        setSlots(result.data);
      } else {
        toast.error(result.error ?? "Saatler yüklenemedi");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setState((s) => ({ ...s, time }));
    setStep("INFO");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.serviceId || !state.staffId || !state.date || !state.time) {
      toast.error("Tüm adımları tamamlayın");
      return;
    }
    if (!state.guestName.trim()) {
      toast.error("Ad soyad gereklidir");
      return;
    }
    if (!state.guestPhone.trim()) {
      toast.error("Telefon numarası gereklidir");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createAppointment(
        {
          serviceId: state.serviceId,
          staffId: state.staffId,
          date: state.date,
          startTime: state.time,
          guestName: state.guestName,
          guestPhone: state.guestPhone,
          guestEmail: state.guestEmail || undefined,
          notes: state.notes || undefined,
        },
        tenantId
      );
      if (!result.success) {
        toast.error(result.error ?? "Randevu oluşturulamadı");
        return;
      }
      setCreatedId((result.data as { id: string }).id);
      setStep("SUCCESS");
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS: Step[] = ["SERVICE", "STAFF", "DATETIME", "INFO"];
  const currentIdx = STEPS.indexOf(step);

  if (step === "SUCCESS") {
    return (
      <div className="text-center space-y-6 py-16">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900">Randevunuz Alındı!</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-left max-w-md mx-auto space-y-3">
          <Detail label="Hizmet" value={selectedService?.name ?? ""} />
          <Detail label="Uzman" value={selectedStaff?.name ?? ""} />
          <Detail
            label="Tarih & Saat"
            value={`${state.date ? format(new Date(state.date), "d MMMM yyyy", { locale: tr }) : ""} — ${state.time}`}
          />
          <Detail label="Ad Soyad" value={state.guestName} />
          {state.guestPhone && <Detail label="Telefon" value={state.guestPhone} />}
        </div>
        {settings.autoConfirm ? (
          <p className="text-green-700 text-sm font-medium">✅ Randevunuz otomatik olarak onaylandı.</p>
        ) : (
          <p className="text-yellow-700 text-sm font-medium">⏳ Randevunuz onay bekliyor.</p>
        )}
        <p className="text-xs text-gray-400">Randevu No: {createdId?.slice(0, 8).toUpperCase()}</p>
        <button
          onClick={() => { setState({ guestName: "", guestPhone: "", guestEmail: "", notes: "" }); setSlots([]); setStep("SERVICE"); }}
          className="text-brand hover:underline text-sm"
        >
          ← Yeni randevu al
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adım göstergesi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-1.5 ${
              i < currentIdx ? "text-green-600" : i === currentIdx ? "text-brand font-semibold" : "text-gray-400"
            }`}>
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                i < currentIdx ? "bg-green-100 text-green-700" : i === currentIdx ? "badge-brand" : "bg-gray-100 text-gray-500"
              }`}>
                {i < currentIdx ? "✓" : i + 1}
              </span>
              <span className="text-sm">{STEP_LABELS[s]}</span>
            </div>
            {i < STEPS.length - 1 && <span className="text-gray-300 mx-1">›</span>}
          </div>
        ))}
      </div>

      {/* Adım 1: Hizmet */}
      {step === "SERVICE" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hizmet Seçin</h2>
          <div className="grid gap-3">
            {services.map((svc) => (
              <button key={svc.id} onClick={() => handleServiceSelect(svc.id)}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover-brand-border hover:shadow-sm transition-all text-left">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: svc.color ?? "#3b82f6" }} />
                  <div>
                    <p className="font-medium text-gray-900">{svc.name}</p>
                    {svc.description && <p className="text-sm text-gray-500">{svc.description}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {svc.price > 0 ? `${svc.price.toLocaleString("tr-TR")} ₺` : "Ücretsiz"}
                  </p>
                  <p className="text-xs text-gray-400">{svc.duration} dk</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Adım 2: Uzman */}
      {step === "STAFF" && (
        <div>
          <button onClick={() => setStep("SERVICE")} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
            ← Geri
          </button>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Uzman Seçin <span className="text-sm font-normal text-gray-500">({selectedService?.name})</span>
          </h2>
          {filteredStaff.length === 0 ? (
            <p className="text-gray-500 text-sm">Bu hizmet için müsait uzman bulunamadı.</p>
          ) : (
            <div className="grid gap-3">
              {filteredStaff.map((staff) => (
                <button key={staff.id} onClick={() => handleStaffSelect(staff.id)}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover-brand-border hover:shadow-sm transition-all text-left">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: staff.color }}>
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{staff.name}</p>
                    {staff.bio && <p className="text-sm text-gray-500">{staff.bio}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adım 3: Tarih & Saat */}
      {step === "DATETIME" && (
        <div>
          <button onClick={() => setStep("STAFF")} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
            ← Geri
          </button>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarih ve Saat Seçin</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
              <input type="date" min={minDate} max={maxDate} value={state.date ?? ""}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand" />
            </div>
            {state.date && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Müsait Saatler</p>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                    <span className="animate-spin">⏳</span> Yükleniyor...
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">Bu tarihte müsait saat yok.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button key={slot.time} onClick={() => slot.isAvailable && handleTimeSelect(slot.time)}
                        disabled={!slot.isAvailable}
                        className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                          !slot.isAvailable ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                            : state.time === slot.time ? "btn-brand" : "badge-brand hover:opacity-80"
                        }`}>
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adım 4: Bilgiler */}
      {step === "INFO" && (
        <div>
          <button onClick={() => setStep("DATETIME")} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
            ← Geri
          </button>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Bilgilerinizi Girin</h2>
          <div className="bg-brand-light rounded-xl p-4 mb-4 grid grid-cols-2 gap-2 text-sm">
            <Detail label="Hizmet" value={selectedService?.name ?? ""} compact />
            <Detail label="Uzman" value={selectedStaff?.name ?? ""} compact />
            <Detail label="Tarih" value={state.date ? format(new Date(state.date), "d MMMM yyyy", { locale: tr }) : ""} compact />
            <Detail label="Saat" value={state.time ?? ""} compact />
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input type="text" required minLength={2} value={state.guestName}
                onChange={(e) => setState((s) => ({ ...s, guestName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand"
                placeholder="Mehmet Yılmaz" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input type="tel" required value={state.guestPhone}
                  onChange={(e) => setState((s) => ({ ...s, guestPhone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand"
                  placeholder="05XX XXX XX XX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input type="email" value={state.guestEmail}
                  onChange={(e) => setState((s) => ({ ...s, guestEmail: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand"
                  placeholder="ornek@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notlar (opsiyonel)</label>
              <textarea rows={3} maxLength={500} value={state.notes}
                onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand resize-none"
                placeholder="Varsa özel notunuzu buraya yazın..." />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full btn-brand rounded-lg py-3 font-medium transition-colors">
              {submitting ? "Randevu oluşturuluyor..." : "🎯 Randevuyu Onayla"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "flex justify-between items-start"}>
      <span className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>{label}</span>
      <span className={`font-medium text-gray-900 ${compact ? "text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}
