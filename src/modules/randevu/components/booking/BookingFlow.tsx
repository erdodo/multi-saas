"use client";

import { useState } from "react";
import { format, addDays, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createAppointment } from "@/modules/randevu/actions/appointment.actions";
import AppointmentCalendar from "./AppointmentCalendar";
import PhoneMaskInput from "./PhoneMaskInput";
import { X, Check } from "lucide-react";

interface BookingService {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  currency: string;
  color: string | null;
}
interface AvailabilityRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
interface BookingStaff {
  id: string;
  name: string;
  bio: string | null;
  color: string;
  serviceIds: string[];
  availableDays: number[];
  availabilityRules: AvailabilityRule[];
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
  primaryColor: string;
  textOnPrimary: string;
}

const DAY_ABBR = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];

function workingLabel(rules: AvailabilityRule[]): string {
  if (!rules.length) return "";
  const daySet = [...new Set(rules.map((r) => r.dayOfWeek))].sort();
  const days = daySet.map((d) => DAY_ABBR[d === 0 ? 6 : d - 1]).join("  ");
  const sorted = [...rules].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );
  const earliest = sorted[0].startTime;
  const latest = [...rules].sort((a, b) =>
    b.endTime.localeCompare(a.endTime),
  )[0].endTime;
  return `${days}  ${earliest}-${latest}`;
}

export default function BookingFlow({
  tenantId,
  tenantSlug,
  services,
  staffList,
  settings,
  primaryColor,
  textOnPrimary,
}: Props) {
  const router = useRouter();
  const today = new Date();
  const minDate = format(today, "yyyy-MM-dd");
  const maxDate = format(
    addDays(today, settings.bookingWindowDays),
    "yyyy-MM-dd",
  );

  const [staffId, setStaffId] = useState<string>(
    staffList.length === 1 ? staffList[0].id : "",
  );
  const defaultServiceId = services[0]?.id ?? "";
  const [selectedServiceId, setSelectedServiceId] =
    useState<string>(defaultServiceId);

  const [dialogDate, setDialogDate] = useState<string | null>(null);
  const [dialogTime, setDialogTime] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dialogOpen = Boolean(dialogDate && dialogTime);
  const selectedStaff = staffList.find((s) => s.id === staffId);

  const closeDialog = () => {
    if (submitting) return;
    setDialogDate(null);
    setDialogTime(null);
    setGuestName("");
    setGuestPhone("");
    setSelectedServiceId(defaultServiceId);
  };

  const handleSlotSelect = (date: string, time: string) => {
    setDialogDate(date);
    setDialogTime(time);
  };

  const handleConfirm = async () => {
    if (!staffId || !dialogDate || !dialogTime) return;
    if (!guestName.trim()) {
      toast.error("Ad soyad gereklidir");
      return;
    }
    if (!guestPhone.trim()) {
      toast.error("Telefon numarası gereklidir");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createAppointment(
        {
          serviceId: selectedServiceId || defaultServiceId,
          staffId,
          date: dialogDate,
          startTime: dialogTime,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
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

  return (
    <>
      <div className="space-y-4">
        {/* Staff selector (only when > 1 staff) */}
        {staffList.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {staffList.map((s) => (
              <button
                key={s.id}
                onClick={() => setStaffId(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  staffId === s.id
                    ? "shadow-md border-transparent"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
                style={
                  staffId === s.id
                    ? {
                        background: primaryColor,
                        color: textOnPrimary,
                        borderColor: primaryColor,
                      }
                    : {}
                }
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: s.color }}
                >
                  {s.name[0].toUpperCase()}
                </span>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* Calendar card */}
        {staffId && defaultServiceId ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mx-auto max-w-sm w-full">
            <AppointmentCalendar
              staffId={staffId}
              serviceId={selectedServiceId || defaultServiceId}
              tenantId={tenantId}
              minDate={minDate}
              maxDate={maxDate}
              onSelect={handleSlotSelect}
            />
            {/* Working hours info */}
            {selectedStaff && selectedStaff.availabilityRules.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  Çalışma günleri:{" "}
                  {workingLabel(selectedStaff.availabilityRules)}
                </p>
              </div>
            )}
          </div>
        ) : staffList.length > 1 ? (
          <p className="text-center text-slate-400 py-16 text-sm">
            Yukarıdaki listeden bir uzman seçin
          </p>
        ) : null}
      </div>

      {/* Booking Dialog */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: "rgba(15,23,42,0.55)" }}
          onClick={(e) => e.target === e.currentTarget && closeDialog()}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl">
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1.5 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Randevu Al
                </h2>
                {dialogDate && dialogTime && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {format(parseISO(dialogDate), "EEEE, d MMMM", {
                      locale: tr,
                    })}{" "}
                     {dialogTime}
                  </p>
                )}
              </div>
              <button
                onClick={closeDialog}
                disabled={submitting}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors -mr-1"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {/* Name */}
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ad Soyad"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-400"
              />

              {/* Phone */}
              <PhoneMaskInput
                value={guestPhone}
                onChange={setGuestPhone}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-400"
              />

              {/* Service chips (optional) */}
              {services.length > 0 && (
                <div>
                  <p className="text-sm text-slate-700 mb-2">
                    Hizmet seçin{" "}
                    <span className="text-slate-400 font-normal text-xs">
                      (opsiyonel)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() =>
                          setSelectedServiceId(
                            selectedServiceId === svc.id
                              ? defaultServiceId
                              : svc.id,
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                          selectedServiceId === svc.id
                            ? "font-medium border-transparent"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                        style={
                          selectedServiceId === svc.id
                            ? {
                                background: primaryColor,
                                color: textOnPrimary,
                                borderColor: primaryColor,
                              }
                            : {}
                        }
                      >
                        {svc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={
                  submitting || !guestName.trim() || !guestPhone.trim()
                }
                className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 mt-1"
                style={{ background: primaryColor, color: textOnPrimary }}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Randevuyu Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
