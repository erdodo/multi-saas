"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  id: string;
  startTime: string;
  customerName: string;
  status: string;
  service: { name: string; color: string | null };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-400",
  CONFIRMED: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-slate-300",
  NO_SHOW:   "bg-red-400",
};

export default function AppCalendar({ appointments }: { appointments: Appointment[] }) {
  const [current, setCurrent] = useState(new Date());

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd     = endOfWeek(monthEnd,     { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

  const getApps = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.startTime), day));

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => subMonths(c, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 capitalize">
          {format(current, "MMMM yyyy", { locale: tr })}
        </h2>
        <button
          onClick={() => setCurrent((c) => addMonths(c, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Gün başlıkları */}
      <div className="grid grid-cols-7 gap-1">
        {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((n) => (
          <div key={n} className="text-center text-xs font-medium text-slate-400 py-2">{n}</div>
        ))}
      </div>

      {/* Hücreler */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const apps      = getApps(day);
          const isToday   = isSameDay(day, new Date());
          const inMonth   = isSameMonth(day, current);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[76px] rounded-lg p-1.5 border transition-colors ${
                inMonth ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100"
              } ${isToday ? "ring-2 ring-blue-500" : ""}`}
            >
              <span
                className={`text-xs font-semibold ${
                  isToday
                    ? "bg-blue-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center"
                    : inMonth ? "text-slate-900" : "text-slate-300"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {apps.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    title={`${a.service.name} — ${a.customerName}`}
                    className={`text-white text-[10px] rounded px-1 truncate ${
                      STATUS_COLORS[a.status] ?? "bg-slate-400"
                    }`}
                  >
                    {format(new Date(a.startTime), "HH:mm")} {a.service.name}
                  </div>
                ))}
                {apps.length > 3 && (
                  <div className="text-[10px] text-slate-400">+{apps.length - 3} daha</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
