"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createAppointment } from "@/modules/appointment/actions/appointment.actions";
import { TimeSlot } from "@/modules/appointment/utils/time-slots";
import { toast } from "sonner"; // Assuming sonner is used in the project, otherwise can be swapped

type Step = "SERVICE" | "STAFF" | "DATE" | "INFO" | "SUCCESS";

interface BookingState {
  serviceId?: string;
  staffId?: string;
  date?: Date;
  time?: string;
  customerName: string;
  customerPhone?: string;
}

export default function BookingFlow({
  tenantId,
  services,
  staffs,
}: {
  tenantId: string;
  services: any[];
  staffs: any[];
}) {
  const [step, setStep] = useState<Step>("SERVICE");
  const [state, setState] = useState<BookingState>({ customerName: "" });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedService = services.find((s) => s.id === state.serviceId);
  const selectedStaff = staffs.find((s) => s.id === state.staffId);

  // Filtrelenmiş personeller (Sadece seçili hizmeti verenler)
  const availableStaffs = staffs.filter((staff) =>
    staff.services.some((ss: any) => ss.serviceId === state.serviceId),
  );

  const handleServiceSelect = (serviceId: string) => {
    setState({
      ...state,
      serviceId,
      staffId: undefined,
      date: undefined,
      time: undefined,
    });
    setStep("STAFF");
  };

  const handleStaffSelect = (staffId: string) => {
    setState({ ...state, staffId, date: undefined, time: undefined });
    setStep("DATE");
  };

  const handleDateSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateStr = e.target.value;
    if (!selectedDateStr || !state.staffId || !selectedService) return;

    const date = new Date(selectedDateStr);
    setState({ ...state, date, time: undefined });

    setIsLoading(true);
    // Fetch slots from Server Action
    const { getAvailableSlots } =
      await import("@/modules/appointment/actions/appointment.actions");
    const result = await getAvailableSlots(
      state.staffId,
      selectedDateStr,
      selectedService.duration,
    );

    if (result.success && result.data) {
      setAvailableSlots(result.data);
    } else {
      toast.error(result.error || "Saatler yüklenemedi");
    }
    setIsLoading(false);
  };

  const handleTimeSelect = (timeSlot: string) => {
    setState({ ...state, time: timeSlot });
    setStep("INFO");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !state.serviceId ||
      !state.staffId ||
      !state.date ||
      !state.time ||
      !state.customerName
    ) {
      toast.error("Lütfen tüm bilgileri eksiksiz doldurun");
      return;
    }

    setIsLoading(true);
    const result = await createAppointment(
      {
        serviceId: state.serviceId,
        staffId: state.staffId,
        date: state.date.toISOString(),
        startTime: state.time,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        customerEmail: undefined,
      },
      tenantId,
    );

    setIsLoading(false);

    if (result.success) {
      toast.success("Randevunuz başarıyla oluşturuldu!");
      setStep("SUCCESS");
    } else {
      toast.error(result.error || "Bir hata oluştu");
    }
  };

  return (
    <div className="bg-white rounded-(--brand-card-radius) shadow-sm border border-neutral-200 overflow-hidden">
      {/* Steps Header */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex gap-2 text-sm font-medium">
          <span
            className={
              step === "SERVICE"
                ? "text-[var(--brand-primary,#2563eb)]"
                : "text-neutral-400"
            }
          >
            1. Hizmet
          </span>
          <span className="text-neutral-300">/</span>
          <span
            className={
              step === "STAFF"
                ? "text-[var(--brand-primary,#2563eb)]"
                : "text-neutral-400"
            }
          >
            2. Personel
          </span>
          <span className="text-neutral-300">/</span>
          <span
            className={
              step === "DATE"
                ? "text-[var(--brand-primary,#2563eb)]"
                : "text-neutral-400"
            }
          >
            3. Zaman
          </span>
          <span className="text-neutral-300">/</span>
          <span
            className={
              step === "INFO"
                ? "text-[var(--brand-primary,#2563eb)]"
                : "text-neutral-400"
            }
          >
            4. Bilgiler
          </span>
        </div>
      </div>

      <div className="p-6">
        {step === "SERVICE" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-6">Hizmet Seçiniz</h2>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="w-full flex items-center justify-between p-4 border rounded-[var(--brand-radius,12px)] hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-left group"
                >
                  <div>
                    <div className="font-medium text-lg">{service.name}</div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {service.duration} Dakika
                    </div>
                  </div>
                  <div className="font-semibold text-lg text-neutral-900 group-hover:text-blue-600">
                    ₺{service.price}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "STAFF" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep("SERVICE")}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                &larr; Geri Dön
              </button>
              <h2 className="text-xl font-semibold">Uzman Seçiniz</h2>
            </div>
            {availableStaffs.length === 0 ? (
              <div className="p-4 bg-orange-50 text-orange-600 rounded-lg text-center">
                Bu hizmeti verebilecek personel bulunamadı.
              </div>
            ) : (
              <div className="grid gap-3">
                {availableStaffs.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff.id)}
                    className="w-full flex items-center gap-4 p-4 border rounded-[var(--brand-radius,12px)] hover:border-[var(--brand-primary,#3b82f6)] hover:ring-1 hover:ring-[var(--brand-primary,#3b82f6)] transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-[var(--brand-primary,#3b82f6)] bg-opacity-10 text-[var(--brand-primary,#2563eb)] rounded-full flex items-center justify-center font-bold text-lg">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-lg">{staff.name}</div>
                      <div className="text-sm text-neutral-500">
                        Uygun saatleri için tıklayın
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "DATE" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setStep("STAFF")}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                &larr; Geri Dön
              </button>
              <h2 className="text-xl font-semibold">Tarih ve Saat Seçiniz</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Randevu Tarihi
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]} // Geçmişi engelle
                onChange={handleDateSelect}
                className="w-full p-3 border rounded-[var(--brand-radius,8px)] focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)] focus:border-transparent outline-none"
              />
            </div>

            {isLoading && (
              <div className="text-center py-8 text-neutral-500">
                Müsait saatler kontrol ediliyor...
              </div>
            )}

            {!isLoading && state.date && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  {format(state.date, "d MMMM yyyy, EEEE", { locale: tr })} İçin
                  Müsait Saatler
                </label>
                {availableSlots.length === 0 ? (
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-lg text-center text-sm">
                    Bu tarihte maalesef uygun saat bulunmuyor. Lütfen başka bir
                    gün seçin.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={!slot.isAvailable}
                        className={`
                          py-2 px-3 rounded-lg text-center font-medium transition-all
                          ${
                            slot.isAvailable
                              ? "bg-[var(--brand-primary,#3b82f6)] bg-opacity-10 text-[var(--brand-primary,#1d4ed8)] hover:opacity-80 cursor-pointer"
                              : "bg-neutral-100 text-neutral-400 cursor-not-allowed line-through"
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === "INFO" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <button
                type="button"
                onClick={() => setStep("DATE")}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                &larr; Geri Dön
              </button>
              <h2 className="text-xl font-semibold">Kişisel Bilgileriniz</h2>
            </div>

            <div className="bg-[var(--brand-primary,#3b82f6)] bg-opacity-10 p-4 rounded-(--brand-card-radius) mb-6 text-sm text-[var(--brand-primary,#1e3a8a)]">
              <div className="font-semibold mb-1">Randevu Özeti:</div>
              <div>
                Hizmet: {selectedService?.name} ({selectedService?.duration} dk)
              </div>
              <div>Uzman: {selectedStaff?.name}</div>
              {state.date && (
                <div>
                  Tarih: {format(state.date, "dd.MM.yyyy")} - Saat:{" "}
                  <span className="font-bold">{state.time}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                required
                value={state.customerName}
                onChange={(e) =>
                  setState({ ...state, customerName: e.target.value })
                }
                className="w-full p-3 border rounded-[var(--brand-radius,8px)] focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)] outline-none"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Telefon Numarası (Opsiyonel)
              </label>
              <input
                type="tel"
                value={state.customerPhone || ""}
                onChange={(e) =>
                  setState({ ...state, customerPhone: e.target.value })
                }
                className="w-full p-3 border rounded-[var(--brand-radius,8px)] focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)] outline-none"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--brand-primary,#2563eb)] hover:opacity-90 text-[var(--brand-text-on-primary,#fff)] font-medium py-3 rounded-[var(--brand-radius,8px)] transition-opacity disabled:opacity-50"
            >
              {isLoading ? "İşleniyor..." : "Randevuyu Onayla"}
            </button>
          </form>
        )}

        {step === "SUCCESS" && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-6">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Randevunuz Alındı!
            </h2>
            <p className="text-neutral-500 max-w-sm mx-auto">
              Sayın <b>{state.customerName}</b>, randevunuz başarıyla
              oluşturulmuştur. Bizi tercih ettiğiniz için teşekkür ederiz.
            </p>
            <div className="pt-6">
              <button
                onClick={() => window.location.reload()}
                className="text-[var(--brand-primary,#2563eb)] font-medium hover:opacity-80 cursor-pointer"
              >
                Yeni Bir Randevu Al
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
