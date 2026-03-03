import { format, formatDistanceToNow, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "Europe/Istanbul";

export function formatInTimezone(date: Date | string, fmt: string, timezone = DEFAULT_TIMEZONE): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const zoned = toZonedTime(d, timezone);
  return format(zoned, fmt, { locale: tr });
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: tr });
}

export function longDate(date: Date | string, timezone = DEFAULT_TIMEZONE): string {
  return formatInTimezone(date, "EEEE, d MMMM yyyy", timezone);
}

export function shortTime(date: Date | string, timezone = DEFAULT_TIMEZONE): string {
  return formatInTimezone(date, "HH:mm", timezone);
}

export function mediumDateTime(date: Date | string, timezone = DEFAULT_TIMEZONE): string {
  return formatInTimezone(date, "d MMM yyyy, HH:mm", timezone);
}

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function buildDateTime(dateStr: string, timeStr: string, timezone = DEFAULT_TIMEZONE): Date {
  const [year, month, day]    = dateStr.split("-").map(Number);
  const [hours, minutes]      = timeStr.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return fromZonedTime(localDate, timezone);
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}
