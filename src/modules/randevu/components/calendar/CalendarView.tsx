"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { tr } from "date-fns/locale";

interface Appointment {
  id: string;
  startAt: Date | null;
  status: string;
  guestName: string | null;
  customer: { firstName: string; lastName: string } | null;
  service: { name: string; color: string | null };
  staff: { name: string; color: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-400",
  CONFIRMED: "bg-[var(--brand-primary,#3b82f6)]",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-gray-300",
  NO_SHOW: "bg-red-400",
  RESCHEDULED: "bg-purple-400",
};

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function CalendarView({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const getAppsForDay = (day: Date) =>
    appointments.filter(
      (a) => a.startAt && isSameDay(new Date(a.startAt), day),
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate((d) => subMonths(d, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, "MMMM yyyy", { locale: tr })}
        </h2>
        <button
          onClick={() => setCurrentDate((d) => addMonths(d, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((n) => (
          <div
            key={n}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {n}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const apps = getAppsForDay(day);
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, currentDate);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] rounded-(--brand-card-radius) p-1.5 border transition-colors ${
                inMonth
                  ? "bg-white border-gray-200"
                  : "bg-gray-50 border-gray-100"
              } ${isToday ? "ring-2 ring-[var(--brand-primary)]" : ""}`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? "bg-[var(--brand-primary)] text-white rounded-full w-5 h-5 inline-flex items-center justify-center"
                    : inMonth
                      ? "text-gray-900"
                      : "text-gray-300"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {apps.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    title={`${a.service.name} — ${a.guestName ?? (a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : "Misafir")}`}
                    className={`text-white text-[10px] rounded px-1 truncate ${STATUS_COLORS[a.status] ?? "bg-gray-400"}`}
                  >
                    {a.startAt && format(new Date(a.startAt), "HH:mm")}{" "}
                    {a.service.name}
                  </div>
                ))}
                {apps.length > 3 && (
                  <div className="text-[10px] text-gray-400">
                    +{apps.length - 3} daha
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
