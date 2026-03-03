import { addMinutes, format, isAfter, isBefore, isSameDay, parse, parseISO } from "date-fns";

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface AvailabilityWindow {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface ExistingAppointment {
  startTime: Date;
  endTime: Date;
}

/**
 * Belirli bir gün için, personelin müsaitlik saatleri ve mevcut randevuları göz önüne alarak
 * hizmet süresine göre boş slotları hesaplar.
 */
export function generateTimeSlots(
  date: Date,
  availability: AvailabilityWindow,
  existingAppointments: ExistingAppointment[],
  serviceDurationMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Müsaitlik başlangıç ve bitiş saatlerini o güne ait Date objesi olarak parse edelim.
  const startOfDay = parse(availability.startTime, "HH:mm", date);
  const endOfDay = parse(availability.endTime, "HH:mm", date);

  let currentSlotTime = startOfDay;

  while (isBefore(addMinutes(currentSlotTime, serviceDurationMinutes), endOfDay) || 
         currentSlotTime.getTime() + serviceDurationMinutes * 60000 === endOfDay.getTime()) {
    
    const slotEndTime = addMinutes(currentSlotTime, serviceDurationMinutes);
    let isAvailable = true;

    // Geçmiş saatleri (bugün için) kapat
    const now = new Date();
    if (isSameDay(date, now) && isBefore(currentSlotTime, now)) {
      isAvailable = false;
    }

    // Mevcut randevularla çakışma kontrolü
    if (isAvailable) {
      for (const appt of existingAppointments) {
        // Çakışma durumu: Seçili slotun başlangıcı, randevunun bitişinden önce VE 
        // Seçili slotun bitişi, randevunun başlangıcından sonra ise çakışır.
        if (
          isBefore(currentSlotTime, appt.endTime) && 
          isAfter(slotEndTime, appt.startTime)
        ) {
          isAvailable = false;
          break;
        }
      }
    }

    slots.push({
      time: format(currentSlotTime, "HH:mm"),
      isAvailable,
    });

    // Slotları şimdilik hizmet süresi kadar atlatıyoruz (Örn 45 dk hizmet için 45 dk aralıklar).
    // İstenirse burası 15 dk'lık veya 30 dk'lık sabit adımlara bölünebilir (buffer time eklenebilir).
    currentSlotTime = addMinutes(currentSlotTime, serviceDurationMinutes); // 15, 30 gibi sabit adım da olabilir
  }

  return slots;
}
