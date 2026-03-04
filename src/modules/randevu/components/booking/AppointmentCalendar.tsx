"use client";

import { useState, useCallback } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
  addDays,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAvailableSlots } from "@/modules/randevu/actions/appointment.actions";
import type { TimeSlot } from "@/modules/randevu/utils/time-slots";

interface Props {
  staffId: string;
  serviceId: string;
  tenantId: string;
  minDate: string; // "YYYY-MM-DD"
  maxDate: string; // "YYYY-MM-DD"
  onSelect: (date: string, time: string) => void;
}

type View = "MONTH" | "DAY";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function AppointmentCalendar({
  staffId,
  serviceId,
  tenantId,
  minDate,
  maxDate,
  onSelect,
}: Props) {
  const [view, setView] = useState<View>("MONTH");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [animating, setAnimating] = useState(false);

  const min = parseISO(minDate);
  const max = parseISO(maxDate);

  // Generate calendar grid (Mon-Sun)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleDayClick = useCallback(
    async (day: Date) => {
      const dateStr = format(day, "yyyy-MM-dd");
      if (isBefore(day, min) || isAfter(day, max)) return;

      setSelectedDate(dateStr);
      setSlots([]);
      setLoadingSlots(true);

      // Animate transition
      setAnimating(true);
      setTimeout(() => {
        setView("DAY");
        setAnimating(false);
      }, 280);

      try {
        const result = await getAvailableSlots(
          staffId,
          dateStr,
          serviceId,
          tenantId,
        );
        if (result.success && result.data) setSlots(result.data);
      } finally {
        setLoadingSlots(false);
      }
    },
    [staffId, serviceId, tenantId, min, max],
  );

  const backToMonth = () => {
    setAnimating(true);
    setTimeout(() => {
      setView("MONTH");
      setAnimating(false);
    }, 280);
  };

  return (
    <div className="overflow-hidden">
      <div
        className={`transition-all duration-300 ease-in-out ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        {/* ── MONTH VIEW ── */}
        {view === "MONTH" && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                disabled={isBefore(subMonths(endOfMonth(currentMonth), 0), min)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="font-semibold text-gray-900 text-sm">
                {format(currentMonth, "MMMM yyyy", { locale: tr })}
              </span>
              <button
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                disabled={isAfter(
                  addMonths(startOfMonth(currentMonth), 1),
                  max,
                )}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 text-center mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-xs font-medium text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((day) => {
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const isDisabled = isBefore(day, min) || isAfter(day, max);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate
                  ? isSameDay(day, parseISO(selectedDate))
                  : false;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() =>
                      !isDisabled && isCurrentMonth && handleDayClick(day)
                    }
                    disabled={isDisabled || !isCurrentMonth}
                    className={`
                      relative h-9 w-full rounded-xl text-sm font-medium transition-all
                      ${!isCurrentMonth ? "opacity-0 pointer-events-none" : ""}
                      ${isDisabled ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                      ${
                        isSelected
                          ? "bg-[var(--brand-primary,#2563eb)] text-[var(--brand-text-on-primary,#fff)] shadow-md"
                          : isToday && !isDisabled
                            ? "ring-2 ring-[var(--brand-primary,#2563eb)] text-[var(--brand-primary,#2563eb)] hover:bg-slate-50"
                            : !isDisabled
                              ? "hover:bg-slate-50 text-gray-700 hover:text-[var(--brand-primary,#2563eb)]"
                              : "text-gray-300"
                      }
                    `}
                    style={{ borderRadius: "var(--brand-radius, 8px)" }}
                  >
                    {format(day, "d")}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--brand-primary,#2563eb)]" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 text-center pt-1">
              Randevu almak istediğiniz güne tıklayın
            </p>
          </div>
        )}

        {/* ── DAY VIEW ── */}
        {view === "DAY" && selectedDate && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={backToMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <p className="font-semibold text-gray-900">
                  {format(parseISO(selectedDate), "d MMMM yyyy EEEE", {
                    locale: tr,
                  })}
                </p>
                <p className="text-xs text-gray-400">Saat seçin</p>
              </div>
            </div>

            {/* Slots */}
            {loadingSlots ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[var(--brand-primary,#2563eb)] rounded-full animate-spin" />
                <p className="text-sm text-gray-400">
                  Müsait saatler yükleniyor...
                </p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-2xl mb-2">😔</p>
                <p className="text-sm text-gray-500">
                  Bu gün için müsait saat bulunmuyor.
                </p>
                <button
                  onClick={backToMonth}
                  className="mt-3 text-sm text-[var(--brand-primary,#2563eb)] hover:underline"
                >
                  Başka bir gün seç
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() =>
                      slot.isAvailable && onSelect(selectedDate, slot.time)
                    }
                    disabled={!slot.isAvailable}
                    className={`
                      rounded-xl py-2.5 px-1 text-sm font-semibold transition-all
                      ${
                        !slot.isAvailable
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                          : "bg-slate-50 text-[var(--brand-primary,#2563eb)] border border-slate-200 hover:bg-[var(--brand-primary,#2563eb)] hover:text-[var(--brand-text-on-primary,#fff)] hover:shadow-md hover:-translate-y-0.5"
                      }
                    `}
                    style={{ borderRadius: "var(--brand-radius, 8px)" }}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
