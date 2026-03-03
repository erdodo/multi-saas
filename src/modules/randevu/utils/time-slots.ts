import { addMinutes, format, isAfter, isBefore, isSameDay, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export interface TimeSlot {
  time: string;       // "HH:mm"
  datetime: string;   // ISO string (UTC)
  isAvailable: boolean;
}

export interface AvailabilityWindow {
  startTime: string;  // "HH:mm"
  endTime:   string;  // "HH:mm"
}

export interface OccupiedPeriod {
  startAt: Date;  // UTC
  endAt:   Date;  // UTC
}

/**
 * Belirli bir gün için müsait zaman dilimlerini üretir.
 */
export function generateTimeSlots(
  date: Date,
  availability: AvailabilityWindow,
  occupied: OccupiedPeriod[],
  serviceDuration: number,
  bufferTime    = 0,
  slotInterval  = 15,
  timezone      = "Europe/Istanbul"
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  const workStart = parse(availability.startTime, "HH:mm", date);
  const workEnd   = parse(availability.endTime,   "HH:mm", date);

  const now      = new Date();
  const nowInTz  = toZonedTime(now, timezone);

  let cursor = workStart;

  while (true) {
    const slotEnd = addMinutes(cursor, serviceDuration);
    if (isAfter(slotEnd, workEnd)) break;

    const isInPast = isSameDay(date, nowInTz) && isBefore(cursor, nowInTz);

    let isOccupied = false;
    if (!isInPast) {
      for (const period of occupied) {
        const periodStartLocal = toZonedTime(period.startAt, timezone);
        const periodEndLocal   = toZonedTime(period.endAt,   timezone);

        if (
          isBefore(cursor, periodEndLocal) &&
          isAfter(addMinutes(slotEnd, bufferTime), periodStartLocal)
        ) {
          isOccupied = true;
          break;
        }
      }
    }

    slots.push({
      time:        format(cursor, "HH:mm"),
      datetime:    cursor.toISOString(),
      isAvailable: !isInPast && !isOccupied,
    });

    cursor = addMinutes(cursor, slotInterval);
  }

  return slots;
}

/** İki periyodun çakışıp çakışmadığını kontrol eder */
export function hasConflict(
  newStart: Date,
  newEnd: Date,
  existing: Array<{ startAt: Date; endAt: Date }>
): boolean {
  return existing.some(
    (e) => isBefore(newStart, e.endAt) && isAfter(newEnd, e.startAt)
  );
}
