"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createAppointment } from "@/modules/randevu/actions/appointment.actions";
import AppointmentCalendar from "@/modules/randevu/components/booking/AppointmentCalendar";
import PhoneMaskInput from "@/modules/randevu/components/booking/PhoneMaskInput";
import { addDays } from "date-fns";

type Step = "SERVICE" | "STAFF" | "DATETIME" | "INFO";

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
};

// E-posta basit doğrulama
function isValidEmail(email: string) {
  return email.includes("@") && email.includes(".");
}

export default function BookingFlow({
  tenantId,
  tenantSlug,
  services,
  staffList,
  settings,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("SERVICE");
  const [state, setState] = useState<BookingState>({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const selectedService = services.find((s) => s.id === state.serviceId);
  const selectedStaff = staffList.find((s) => s.id === state.staffId);
  const filteredStaff = staffList.filter((s) =>
    s.serviceIds.includes(state.serviceId ?? ""),
  );

  const today = new Date();
  const minDate = format(today, "yyyy-MM-dd");
  const maxDate = format(
    addDays(today, settings.bookingWindowDays),
    "yyyy-MM-dd",
  );

  const handleServiceSelect = (serviceId: string) => {
    setState((s) => ({
      ...s,
      serviceId,
      staffId: undefined,
      date: undefined,
      time: undefined,
    }));
    setStep("STAFF");
  };
  const handleStaffSelect = (staffId: string) => {
    setState((s) => ({ ...s, staffId, date: undefined, time: undefined }));
    setStep("DATETIME");
  };
  const handleCalendarSelect = (date: string, time: string) => {
    setState((s) => ({ ...s, date, time }));
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
    if (state.guestEmail && !isValidEmail(state.guestEmail)) {
      toast.error("Geçerli bir e-posta girin");
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
        tenantId,
      );
      if (!result.success) {
        toast.error(result.error ?? "Randevu oluşturulamadı");
        return;
      }
      const id = (result.data as { id: string }).id;
      router.push(`/${tenantSlug}/randevu-panel/book/${id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS: Step[] = ["SERVICE", "STAFF", "DATETIME", "INFO"];
  const currentIdx = STEPS.indexOf(step);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 ${
                i < currentIdx
                  ? "text-green-600"
                  : i === currentIdx
                    ? "text-brand font-semibold"
                    : "text-gray-400"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  i < currentIdx
                    ? "bg-green-100 text-green-700"
                    : i === currentIdx
                      ? "badge-brand"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {i < currentIdx ? "✓" : i + 1}
              </span>
              <span className="text-sm">{STEP_LABELS[s]}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="text-gray-300 mx-1">›</span>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Hizmet */}
      {step === "SERVICE" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hizmet Seçin
          </h2>
          <div className="grid gap-3">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleServiceSelect(svc.id)}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover-brand-border hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ background: svc.color ?? "#3b82f6" }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{svc.name}</p>
                    {svc.description && (
                      <p className="text-sm text-gray-500">{svc.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {svc.price > 0
                      ? `${svc.price.toLocaleString("tr-TR")} ₺`
                      : "Ücretsiz"}
                  </p>
                  <p className="text-xs text-gray-400">{svc.duration} dk</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Uzman */}
      {step === "STAFF" && (
        <div>
          <button
            onClick={() => setStep("SERVICE")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← Geri
          </button>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Uzman Seçin{" "}
            <span className="text-sm font-normal text-gray-500">
              ({selectedService?.name})
            </span>
          </h2>
          {filteredStaff.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Bu hizmet için müsait uzman bulunamadı.
            </p>
          ) : (
            <div className="grid gap-3">
              {filteredStaff.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleStaffSelect(staff.id)}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover-brand-border hover:shadow-sm transition-all text-left"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: staff.color }}
                  >
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{staff.name}</p>
                    {staff.bio && (
                      <p className="text-sm text-gray-500">{staff.bio}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Tarih & Saat — Animasyonlu Takvim */}
      {step === "DATETIME" && (
        <div>
          <button
            onClick={() => setStep("STAFF")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← Geri
          </button>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tarih ve Saat Seçin
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {state.staffId && state.serviceId && (
              <AppointmentCalendar
                staffId={state.staffId}
                serviceId={state.serviceId}
                tenantId={tenantId}
                minDate={minDate}
                maxDate={maxDate}
                onSelect={handleCalendarSelect}
              />
            )}
          </div>
        </div>
      )}

      {/* Step 4: Bilgiler */}
      {step === "INFO" && (
        <div>
          <button
            onClick={() => setStep("DATETIME")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← Geri
          </button>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Bilgilerinizi Girin
          </h2>
          <div className="bg-brand-light rounded-xl p-4 mb-4 grid grid-cols-2 gap-2 text-sm">
            <Detail
              label="Hizmet"
              value={selectedService?.name ?? ""}
              compact
            />
            <Detail label="Uzman" value={selectedStaff?.name ?? ""} compact />
            <Detail
              label="Tarih"
              value={
                state.date
                  ? format(new Date(state.date + "T00:00:00"), "d MMMM yyyy", {
                      locale: tr,
                    })
                  : ""
              }
              compact
            />
            <Detail label="Saat" value={state.time ?? ""} compact />
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={state.guestName}
                onChange={(e) =>
                  setState((s) => ({ ...s, guestName: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand"
                placeholder="Mehmet Yılmaz"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <PhoneMaskInput
                  required
                  value={state.guestPhone}
                  onChange={(v) => setState((s) => ({ ...s, guestPhone: v }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="text"
                  value={state.guestEmail}
                  onChange={(e) =>
                    setState((s) => ({ ...s, guestEmail: e.target.value }))
                  }
                  onBlur={() => setEmailTouched(true)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ring-brand ${
                    emailTouched &&
                    state.guestEmail &&
                    !isValidEmail(state.guestEmail)
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                  placeholder="ornek@email.com"
                />
                {emailTouched &&
                  state.guestEmail &&
                  !isValidEmail(state.guestEmail) && (
                    <p className="text-xs text-red-500 mt-1">
                      Geçerli bir e-posta girin (@, . içermeli)
                    </p>
                  )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar (opsiyonel)
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={state.notes}
                onChange={(e) =>
                  setState((s) => ({ ...s, notes: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand resize-none"
                placeholder="Varsa özel notunuzu buraya yazın..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-brand rounded-lg py-3 font-medium transition-colors"
            >
              {submitting ? "Randevu oluşturuluyor..." : "🎯 Randevuyu Onayla"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "flex justify-between items-start"}>
      <span className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>
        {label}
      </span>
      <span
        className={`font-medium text-gray-900 ${compact ? "text-xs" : "text-sm"}`}
      >
        {value}
      </span>
    </div>
  );
}
