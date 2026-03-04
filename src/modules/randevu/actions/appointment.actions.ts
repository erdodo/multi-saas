"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  createAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentStatusSchema,
  appointmentQuerySchema,
  type CreateAppointmentInput,
  type AppointmentQueryInput,
} from "../schemas";
import { generateTimeSlots } from "../utils/time-slots";
import { buildDateTime } from "../utils/date";
import { addMinutes, parseISO, startOfDay, endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { logger } from "../lib/logger";

// ─── Müsait slotları getir ────────────────────────────────────────────────────
export async function getAvailableSlots(
  staffId: string,
  dateStr: string,
  serviceId: string,
  tenantId: string
) {
  try {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, tenantId, isActive: true },
    });
    if (!service) return { success: false, error: "Hizmet bulunamadı" };

    const settings = await prisma.tenantSettings.findUnique({ where: { tenantId } });
    const tenant   = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const timezone = tenant?.timezone ?? "Europe/Istanbul";

    const targetDate = parseISO(dateStr);
    const dayOfWeek  = targetDate.getDay();

    const availRule = await prisma.availabilityRule.findFirst({
      where: { staffId, dayOfWeek, isActive: true },
    });
    if (!availRule) return { success: true, data: [] };

    // Tatil kontrolü
    const holiday = await prisma.holiday.findFirst({
      where: {
        tenantId,
        date: { gte: startOfDay(targetDate), lte: endOfDay(targetDate) },
      },
    });
    if (holiday) return { success: true, data: [] };

    // Personel izin kontrolü
    const timeOff = await prisma.timeOff.findFirst({
      where: {
        staffId,
        startAt: { lte: endOfDay(targetDate) },
        endAt:   { gte: startOfDay(targetDate) },
      },
    });
    if (timeOff) return { success: true, data: [] };

    // O güne ait mevcut randevular
    const startUtc = fromZonedTime(startOfDay(targetDate), timezone);
    const endUtc   = fromZonedTime(endOfDay(targetDate),   timezone);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        staffId,
        startAt: { gte: startUtc },
        endAt:   { lte: endUtc },
        status:  { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startAt: true, endAt: true },
    });

    // Personel mola saatlerini dolu randevu gibi işle
    const staffBreaks = await prisma.staffBreak.findMany({
      where: { staffId, dayOfWeek },
    });
    const breakBlocks = staffBreaks.map((b) => ({
      startAt: fromZonedTime(
        new Date(`${dateStr}T${b.startTime}:00`),
        timezone
      ),
      endAt: fromZonedTime(
        new Date(`${dateStr}T${b.endTime}:00`),
        timezone
      ),
    }));

    const slots = generateTimeSlots(
      targetDate,
      { startTime: availRule.startTime, endTime: availRule.endTime },
      [
        ...existingAppointments
          .filter((a) => a.startAt !== null && a.endAt !== null)
          .map((a) => ({ startAt: a.startAt as Date, endAt: a.endAt as Date })),
        ...breakBlocks,
      ],
      Number(service.duration),
      Number(service.bufferTime),
      settings?.slotIntervalMinutes ?? 15,
      timezone
    );

    return { success: true, data: slots };
  } catch (err) {
    logger.error({ err }, "getAvailableSlots hatası");
    return { success: false, error: "Müsait saatler alınırken hata oluştu" };
  }
}

// ─── Randevu oluştur ──────────────────────────────────────────────────────────
export async function createAppointment(data: CreateAppointmentInput, tenantId: string) {
  try {
    const validated = createAppointmentSchema.parse(data);

    const service = await prisma.service.findFirst({
      where: { id: validated.serviceId, tenantId, isActive: true },
    });
    if (!service) return { success: false, error: "Hizmet bulunamadı" };

    const staff = await prisma.staff.findFirst({
      where: {
        id: validated.staffId,
        tenantId,
        isActive: true,
        staffServices: { some: { serviceId: validated.serviceId } },
      },
    });
    if (!staff) return { success: false, error: "Personel bu hizmeti veremez" };

    const tenant   = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const timezone = tenant?.timezone ?? "Europe/Istanbul";

    const startAt = buildDateTime(validated.date, validated.startTime, timezone);
    const endAt   = addMinutes(startAt, Number(service.duration));

    const holiday = await prisma.holiday.findFirst({
      where: {
        tenantId,
        date: {
          gte: startOfDay(parseISO(validated.date)),
          lte: endOfDay(parseISO(validated.date)),
        },
      },
    });
    if (holiday)
      return { success: false, error: `${holiday.name} tatili nedeniyle randevu alınamaz` };

    const settings   = await prisma.tenantSettings.findUnique({ where: { tenantId } });
    const minNoticeMs = (settings?.minNoticeHours ?? 2) * 60 * 60 * 1000;
    if (startAt.getTime() - Date.now() < minNoticeMs)
      return { success: false, error: `Randevu en az ${settings?.minNoticeHours ?? 2} saat önceden alınabilir` };

    const maxDays = settings?.bookingWindowDays ?? 60;
    const maxDate = addMinutes(new Date(), maxDays * 24 * 60);
    if (startAt > maxDate)
      return { success: false, error: `En fazla ${maxDays} gün ilerisine randevu alınabilir` };

    const result = await prisma.$transaction(async (tx) => {
      const conflicting = await tx.appointment.findFirst({
        where: {
          staffId: validated.staffId,
          status:  { in: ["PENDING", "CONFIRMED"] },
          AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
        },
      });
      if (conflicting) throw new Error("CONFLICT");

      const appointment = await tx.appointment.create({
        data: {
          tenantId,
          staffId:    validated.staffId,
          serviceId:  validated.serviceId,
          customerId: validated.customerId ?? null,
          locationId: validated.locationId ?? null,
          guestName:  validated.guestName,
          guestPhone: validated.guestPhone,
          guestEmail: validated.guestEmail,
          notes:      validated.notes,
          startAt,
          endAt,
          status:      settings?.autoConfirm ? "CONFIRMED" : "PENDING",
          confirmedAt: settings?.autoConfirm ? new Date() : null,
        },
        include: { service: true, staff: true },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          action:     "appointment.created",
          entityType: "Appointment",
          entityId:   appointment.id,
          newValue:   JSON.stringify({ startAt, endAt, status: appointment.status }),
        },
      });

      return appointment;
    });

    revalidatePath(`/randevu-panel/dashboard`);
    logger.info({ appointmentId: result.id, tenantId }, "Randevu oluşturuldu");

    // Telefon numarasına göre müşteri upsert — önceden yoksa yeni kayıt
    if (validated.guestPhone) {
      const nameParts = (validated.guestName ?? "").trim().split(/\s+/);
      const firstName = nameParts[0] ?? "Misafir";
      const lastName  = nameParts.slice(1).join(" ") || "-";
      const phone     = validated.guestPhone.trim();

      const existing = await prisma.customer.findFirst({
        where: { tenantId, phone },
      });

      const customer = existing ?? await prisma.customer.create({
        data: { tenantId, firstName, lastName, phone, email: validated.guestEmail ?? null },
      });

      // Randevuyu müşteriyle ilişkilendir
      await prisma.appointment.update({
        where: { id: result.id },
        data:  { customerId: customer.id },
      });
    }

    return { success: true, data: result };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "CONFLICT")
      return { success: false, error: "Seçilen saat dilimi dolu, başka bir saat seçin" };
    if (err instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any).issues?.[0]?.message ?? err.message ?? "Geçersiz randevu verisi";
      return { success: false, error: msg };
    }
    logger.error({ err }, "createAppointment hatası");
    return { success: false, error: "Randevu oluşturulurken hata oluştu" };
  }
}

// ─── Randevuları listele ──────────────────────────────────────────────────────
export async function getAppointments(tenantId: string, query: AppointmentQueryInput) {
  try {
    const q = appointmentQuerySchema.parse(query);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      tenantId,
      ...(q.status    && { status:    q.status }),
      ...(q.staffId   && { staffId:   q.staffId }),
      ...(q.serviceId && { serviceId: q.serviceId }),
      ...((q.dateFrom || q.dateTo) && {
        startAt: {
          ...(q.dateFrom && { gte: new Date(q.dateFrom) }),
          ...(q.dateTo   && { lte: new Date(q.dateTo + "T23:59:59Z") }),
        },
      }),
      ...(q.search && {
        OR: [
          { guestName:  { contains: q.search } },
          { guestEmail: { contains: q.search } },
          { guestPhone: { contains: q.search } },
        ],
      }),
    };

    const [total, appointments] = await prisma.$transaction([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        skip:    (q.page - 1) * q.pageSize,
        take:    q.pageSize,
        orderBy: { [q.sortBy]: q.sortOrder },
        include: {
          service:  { select: { name: true, duration: true, color: true } },
          staff:    { select: { name: true, color: true } },
          customer: { select: { firstName: true, lastName: true, phone: true } },
          location: { select: { name: true } },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        appointments,
        pagination: { total, page: q.page, pageSize: q.pageSize, totalPages: Math.ceil(total / q.pageSize) },
      },
    };
  } catch (err) {
    logger.error({ err }, "getAppointments hatası");
    return { success: false, error: "Randevular alınırken hata oluştu" };
  }
}

// ─── Durum güncelle ───────────────────────────────────────────────────────────
export async function updateAppointmentStatus(
  input: { appointmentId: string; status: string; internalNotes?: string },
  tenantId: string
) {
  try {
    const { appointmentId, status, internalNotes } =
      updateAppointmentStatusSchema.parse(input);

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });
    if (!appointment) return { success: false, error: "Randevu bulunamadı" };

    const session = await auth();
    const userId  = session?.user?.id ?? null;

    const updated = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status:       status as never,
          internalNotes: internalNotes ?? appointment.internalNotes,
          ...(status === "CONFIRMED"  && { confirmedAt: new Date() }),
          ...(status === "NO_SHOW"    && { noShowAt:    new Date() }),
          ...(status === "CANCELLED"  && { cancelledAt: new Date() }),
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action:     "appointment.status_changed",
          entityType: "Appointment",
          entityId:   appointmentId,
          oldValue:   JSON.stringify({ status: appointment.status }),
          newValue:   JSON.stringify({ status }),
        },
      });
      return appt;
    });

    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: updated };
  } catch (err) {
    logger.error({ err }, "updateAppointmentStatus hatası");
    return { success: false, error: "Durum güncellenirken hata oluştu" };
  }
}

// ─── İptal ────────────────────────────────────────────────────────────────────
export async function cancelAppointment(
  input: { appointmentId: string; cancelReason?: string },
  tenantId: string
) {
  try {
    const { appointmentId, cancelReason } = cancelAppointmentSchema.parse(input);

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });
    if (!appointment) return { success: false, error: "Randevu bulunamadı" };

    if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status))
      return { success: false, error: "Bu randevu iptal edilemez" };

    const policy = await prisma.cancelPolicy.findUnique({ where: { tenantId } });
    const minHours   = policy?.minHoursBeforeCancel ?? 12;
    const startAt    = appointment.startAt;
    if (startAt) {
      const hoursUntil = (startAt.getTime() - Date.now()) / 3600000;
      if (hoursUntil < minHours && hoursUntil > 0)
        return { success: false, error: `Randevu ${minHours} saatten az kala iptal edilemez` };
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data:  { status: "CANCELLED", cancelReason, cancelledAt: new Date() },
    });

    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: updated };
  } catch (err) {
    logger.error({ err }, "cancelAppointment hatası");
    return { success: false, error: "İptal işlemi sırasında hata oluştu" };
  }
}

// ─── Dashboard istatistikleri ─────────────────────────────────────────────────
export async function getDashboardStats(tenantId: string) {
  try {
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEnd   = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayTotal, todayConfirmed, todayPending, weekTotal, monthAppointments] =
      await prisma.$transaction([
        prisma.appointment.count({ where: { tenantId, startAt: { gte: today, lt: tomorrow } } }),
        prisma.appointment.count({ where: { tenantId, startAt: { gte: today, lt: tomorrow }, status: "CONFIRMED" } }),
        prisma.appointment.count({ where: { tenantId, startAt: { gte: today, lt: tomorrow }, status: "PENDING" } }),
        prisma.appointment.count({
          where: {
            tenantId,
            startAt: { gte: weekStart, lte: weekEnd },
            status:  { in: ["CONFIRMED", "COMPLETED"] },
          },
        }),
        prisma.appointment.findMany({
          where: {
            tenantId,
            startAt: { gte: monthStart, lte: monthEnd },
            status:  "COMPLETED",
          },
          include: { service: { select: { price: true } } },
        }),
      ]);

    const revenue = monthAppointments.reduce((sum, a) => sum + Number(a.service.price), 0);

    return {
      success: true,
      data: {
        today: { total: todayTotal, confirmed: todayConfirmed, pending: todayPending },
        week:  { total: weekTotal },
        month: { revenue },
      },
    };
  } catch (err) {
    logger.error({ err }, "getDashboardStats hatası");
    return { success: false, error: "İstatistikler alınırken hata oluştu" };
  }
}

// ─── Randevu detayı (onay sayfası) ────────────────────────────────────────────
export async function getAppointmentById(id: string, tenantSlug: string) {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return { success: false, error: "İşletme bulunamadı" };

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        service:  { select: { name: true, duration: true, color: true } },
        staff:    { select: { name: true } },
        customer: { select: { firstName: true, lastName: true } },
        location: { select: { name: true } },
      },
    });
    if (!appointment) return { success: false, error: "Randevu bulunamadı" };
    return { success: true, data: appointment };
  } catch (err) {
    logger.error({ err }, "getAppointmentById hatası");
    return { success: false, error: "Randevu alınırken hata oluştu" };
  }
}

// ─── Telefona göre randevular (sorgulama sayfası) ─────────────────────────────
export async function getAppointmentsByPhone(phone: string, tenantSlug: string) {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return { success: false, error: "İşletme bulunamadı" };

    const normalized = phone.replace(/\s/g, "");
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        OR: [
          { guestPhone: { contains: normalized } },
          { customer:   { phone: { contains: normalized } } },
        ],
      },
      orderBy: { startAt: "desc" },
      take: 20,
      include: {
        service:  { select: { name: true, color: true } },
        staff:    { select: { name: true } },
      },
    });
    return { success: true, data: appointments };
  } catch (err) {
    logger.error({ err }, "getAppointmentsByPhone hatası");
    return { success: false, error: "Randevular alınırken hata oluştu" };
  }
}
